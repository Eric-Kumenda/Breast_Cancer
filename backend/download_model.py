import os
import requests

MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "vit_mammogram_model.keras")

MODEL_URL = "https://huggingface.co/ThioEric/Breast_Mammogram_VIT_CNN/resolve/main/vit_mammogram_model.keras"

def download_model():
    os.makedirs(MODEL_DIR, exist_ok=True)

    if os.path.exists(MODEL_PATH):
        print("✅ Model already exists")
        return

    print("⬇️ Downloading model...")

    with requests.get(MODEL_URL, stream=True, timeout=60) as r:
        r.raise_for_status()
        with open(MODEL_PATH, "wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)

    print("✅ Model downloaded")

if __name__ == "__main__":
    download_model()
