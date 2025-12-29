# ... imports

import os
import numpy as np
import tensorflow as tf
import keras
from keras import layers, ops
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
from PIL import Image
from werkzeug.utils import secure_filename
import io
import cv2
import time
import uuid
import base64

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase Setup
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key) if url and key else None

# --- ViT Model Architecture ---

def mlp(x, hidden_units, dropout_rate):
    for units in hidden_units:
        x = layers.Dense(units, activation=keras.activations.gelu)(x)
        x = layers.Dropout(dropout_rate)(x)
    return x

class Patches(layers.Layer):
    def __init__(self, patch_size):
        super().__init__()
        self.patch_size = patch_size

    def call(self, images):
        input_shape = ops.shape(images)
        batch_size = input_shape[0]
        height = input_shape[1]
        width = input_shape[2]
        channels = input_shape[3]
        num_patches_h = height // self.patch_size
        num_patches_w = width // self.patch_size
        patches = keras.ops.image.extract_patches(images, size=self.patch_size)
        patches = ops.reshape(
            patches,
            (
                batch_size,
                num_patches_h * num_patches_w,
                self.patch_size * self.patch_size * channels,
            ),
        )
        return patches

    def get_config(self):
        config = super().get_config()
        config.update({"patch_size": self.patch_size})
        return config

class PatchEncoder(layers.Layer):
    def __init__(self, num_patches, projection_dim):
        super().__init__()
        self.num_patches = num_patches
        self.projection = layers.Dense(units=projection_dim)
        self.position_embedding = layers.Embedding(
            input_dim=num_patches, output_dim=projection_dim
        )

    def call(self, patch):
        positions = ops.expand_dims(
            ops.arange(start=0, stop=self.num_patches, step=1), axis=0
        )
        projected_patches = self.projection(patch)
        encoded = projected_patches + self.position_embedding(positions)
        return encoded

    def get_config(self):
        config = super().get_config()
        config.update({"num_patches": self.num_patches})
        return config

def create_vit_classifier():
    inputs = keras.Input(shape=(224, 224, 1))
    patches = Patches(patch_size=16)(inputs)
    num_patches = (224 // 16) ** 2
    encoded_patches = PatchEncoder(num_patches, projection_dim=64)(patches)
    for _ in range(8):
        x1 = layers.LayerNormalization(epsilon=1e-6)(encoded_patches)
        attention_output = layers.MultiHeadAttention(
            num_heads=4, key_dim=64, dropout=0.1
        )(x1, x1)
        x2 = layers.Add()([attention_output, encoded_patches])
        x3 = layers.LayerNormalization(epsilon=1e-6)(x2)
        x3 = mlp(x3, hidden_units=[128, 64], dropout_rate=0.1)
        encoded_patches = layers.Add()([x3, x2])
    representation = layers.LayerNormalization(epsilon=1e-6)(encoded_patches)
    representation = layers.Flatten()(representation)
    representation = layers.Dropout(0.5)(representation)
    features = mlp(representation, hidden_units=[2048, 1024], dropout_rate=0.5)
    logits = layers.Dense(2)(features)
    model = keras.Model(inputs=inputs, outputs=logits)
    return model

# --- Model Loading ---

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'vit_mammogram_model.keras')
ULTRA_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'ultrasound_unet_model.h5')

model = None
ultrasound_model = None

def load_model():
    global model, ultrasound_model
    try:
        if os.path.exists(MODEL_PATH):
            print(f"Loading model architecture and weights from {MODEL_PATH}...")
            # Instantiate model architecture directly from code
            model = create_vit_classifier()
            # Load weights
            model.load_weights(MODEL_PATH)
            print("Model loaded successfully.")
        else:
            print(f"Model not found at {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {e}")
        import traceback
        traceback.print_exc()

    # --- Load Ultrasound Model ---
    try:
        if os.path.exists(ULTRA_MODEL_PATH):
            print(f"🔹 Loading Ultrasound U-Net from {ULTRA_MODEL_PATH}...")
            # compile=False is critical for avoiding custom loss function errors during inference
            ultrasound_model = tf.keras.models.load_model(ULTRA_MODEL_PATH, compile=False)
            print("✅ Ultrasound Model loaded.")
        else:
            print(f"⚠️ Warning: Ultrasound model NOT found at {ULTRA_MODEL_PATH}. (Skipping)")
    except Exception as e:
        print(f"❌ Error loading Ultrasound model: {e}")

load_model()

def preprocess_image(image_bytes):
    # Convert bytes to PIL Image
    img = Image.open(io.BytesIO(image_bytes))
    
    # 1. Convert to Grayscale ('L')
    img = img.convert('L')
    
    # 2. Resize to 224x224
    target_size = (224, 224)
    img = img.resize(target_size)
    
    # 3. Convert to array
    img_array = np.array(img)
    
    # Expand dims to (1, 224, 224, 1)
    img_array = np.expand_dims(img_array, axis=-1)
    img_array = np.expand_dims(img_array, axis=0)
    
    # 4. Normalization (MATCHING TRAINING DATA)
    # FIX: Do NOT divide by 255.0 here, because the notebook didn't.
    img_array = img_array.astype("float32")
    
    # Apply the (x - mean) / sqrt(variance) formula used in training
    # mean=0.5, variance=0.25 -> std_dev=0.5
    img_array = (img_array - 0.5) / 0.5
    
    return img_array, img

def preprocess_ultrasound(image_bytes):
    """
    Converts raw bytes -> RGB -> Resized (128x128) -> Normalized (0 to 1)
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR) # Keep RGB
    
    if img is None:
        raise ValueError("Could not decode image")
        
    img_resized = cv2.resize(img, (128, 128))
    img_norm = img_resized / 255.0 # Normalize to [0, 1]
    img_input = np.expand_dims(img_norm, axis=0) # Add batch dim
    
    return img_input, img_resized


# ... health check ...

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "models_status": {
            "mammogram": "Active" if model else "Inactive",
            "ultrasound": "Active" if ultrasound_model else "Inactive"
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    # ... checks ...
    if not model:
         return jsonify({"error": "Model not loaded"}), 500

    # ... auth checks (same as before) ...
    # Verify Auth
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Missing Authorization header"}), 401
    
    token = auth_header.split(" ")[1]
    
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        print(f"Auth error: {e}")
        return jsonify({"error": "Invalid token"}), 401

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        file_bytes = file.read()
        filename = secure_filename(file.filename)
        
        # Preprocess for ViT
        processed_img, original_pil = preprocess_image(file_bytes)
        
        # Predict
        logits = model.predict(processed_img) # Model returns logits
        
        # Apply Softmax to get probabilities (since from_logits=True was used)
        probabilities = keras.ops.softmax(logits).numpy()[0]
        
        prob_benign = float(probabilities[0])
        prob_malignant = float(probabilities[1])
        
        label = "Malignant" if prob_malignant > prob_benign else "Benign"
        confidence = prob_malignant if label == "Malignant" else prob_benign # Confidence of the class

        # ... Supabase Upload (same as before) ...


        # --- Supabase Integration ---
        
        # 1. Upload Original Image
        # Create a unique path
        unique_id = str(uuid.uuid4())
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
        storage_path = f"{user_id}/{unique_id}.{file_ext}"
        
        # Reset file pointer or use bytes
        try:
            res = supabase.storage.from_("mammo-scans").upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": file.content_type}
            )
            # Get Public URL
            public_url_res = supabase.storage.from_("mammo-scans").get_public_url(storage_path)
            # Depending on supabase version, get_public_url might return string or string inside logic
            # Usually it returns the URL string directly
            image_url = public_url_res
            
        except Exception as storage_err:
            print(f"Storage Error: {storage_err}")
            # Fallback to empty URL if storage fails, but proceed (or fail?)
            # Let's fail for now as storage is critical requirement
            # If bucket doesn't exist, this will fail.
            image_url = ""
            print("Ensure 'mammo-scans' bucket exists and is public.")

        # 2. Save to Database
        if image_url:
            db_data = {
                "user_id": user_id,
                "original_image_url": image_url,
                "prediction_label": label,
                "confidence_score": confidence,
                "annotated_image_url": image_url, # For now same as original
                "scan_type": "mammogram"
            }
            db_res = supabase.table("scans").insert(db_data).execute()
        
        return jsonify({
            "prediction": label,
            "confidence": confidence,
            "image_url": image_url,
            "raw_output": probabilities.tolist()
        })

    except Exception as e:
        print(f"Error processing: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/scans/<scan_id>', methods=['DELETE'])
def delete_scan(scan_id):
    if not model:
         return jsonify({"error": "Model not loaded"}), 500

    # Verify Auth
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Missing Authorization header"}), 401
    
    token = auth_header.split(" ")[1]
    
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        print(f"Auth error: {e}")
        return jsonify({"error": "Invalid token"}), 401

    try:
        # 1. Fetch scan to get storage path
        res = supabase.table("scans").select("*").eq("id", scan_id).execute()
        
        if not res.data or len(res.data) == 0:
            return jsonify({"error": "Scan not found or access denied"}), 404
        
        scan = res.data[0]
        # Verify ownership
        if scan.get('user_id') != user_id:
             return jsonify({"error": "Unauthorized"}), 403

        # 2. Delete from Storage
        original_url = scan.get('original_image_url')
        if original_url:
            if "mammo-scans/" in original_url:
                # Extract path after mammo-scans/
                # e.g. .../mammo-scans/userid/file.jpg
                # We need userid/file.jpg
                storage_path = original_url.split("mammo-scans/")[1]
                storage_path = storage_path.split("?")[0]
                
                print(f"Deleting file: {storage_path}")
                supabase.storage.from_("mammo-scans").remove([storage_path])

        # 3. Delete from Database
        supabase.table("scans").delete().eq("id", scan_id).execute()
        
        return jsonify({"message": "Scan deleted successfully"})

    except Exception as e:
        print(f"Delete error: {e}")
        return jsonify({"error": str(e)}), 500

# --- ULTRASOUND PREDICTION ---
@app.route('/ultrasound', methods=['POST'])
def predict_ultrasound():
    if not ultrasound_model:
        return jsonify({"error": "Ultrasound model is not active on the server."}), 503

    # Verify Auth
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Missing Authorization header"}), 401
    
    token = auth_header.split(" ")[1]
    
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        print(f"Auth error: {e}")
        return jsonify({"error": "Invalid token"}), 401

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        file_bytes = file.read()
        filename = secure_filename(file.filename)
        
        # 1. Preprocess
        input_tensor, original_img = preprocess_ultrasound(file_bytes)
        
        # 2. Predict (Segmentation Map)
        pred_mask = ultrasound_model.predict(input_tensor)
        
        # 3. Post-Process Mask
        # Threshold at 0.5 (Pixels > 0.5 are tumor)
        mask = (pred_mask > 0.5).astype(np.uint8) * 255
        mask_2d = mask[0, :, :, 0] # Remove extra dims to get 128x128 image
        
        # 4. Check Diagnosis
        has_tumor = np.sum(mask_2d) > 0 # If any white pixels exist, tumor is found
        confidence = float(np.max(pred_mask)) # Max probability in the map
        
        # 5. Convert Mask to Base64 (For frontend display)
        _, buffer = cv2.imencode('.png', mask_2d)
        mask_base64 = base64.b64encode(buffer).decode('utf-8')

        label = "Potential Abnormality Detected" if has_tumor else "No Abnormality Detected"
        
        # 6. Save to Supabase
        image_url = ""
        if supabase:
             # Create a unique path
            unique_id = str(uuid.uuid4())
            file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
            # Using same bucket 'mammo-scans'
            storage_path = f"{user_id}/ultrasound_{unique_id}.{file_ext}"
            
            try:
                res = supabase.storage.from_("mammo-scans").upload(
                    path=storage_path,
                    file=file_bytes,
                    file_options={"content-type": file.content_type}
                )
                public_url_res = supabase.storage.from_("mammo-scans").get_public_url(storage_path)
                image_url = public_url_res
                
            except Exception as storage_err:
                print(f"Storage Error (Ultrasound): {storage_err}")
                image_url = ""

        # 7. Save to Database
        if image_url:
            db_data = {
                "user_id": user_id,
                "original_image_url": image_url,
                "prediction_label": label,
                "confidence_score": confidence,
                "annotated_image_url": image_url, 
                "scan_type": "ultrasound"
            }
            db_res = supabase.table("scans").insert(db_data).execute()

        return jsonify({
            "type": "ultrasound",
            "prediction": label, 
            "diagnosis": label,
            "tumor_detected": bool(has_tumor),
            "confidence": confidence,
            "mask_image": f"data:image/png;base64,{mask_base64}",
            "image_url": image_url
        })

    except Exception as e:
        print(f"Ultrasound Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
