# API Endpoints Documentation

## Base URL

`http://localhost:5000`

## Health Check

-   **GET** `/health`
-   **Description**: Checks if the API and models are active.
-   **Response**:
    ```json
    {
    	"status": "healthy",
    	"models_status": {
    		"mammogram": "Active",
    		"ultrasound": "Active"
    	}
    }
    ```

## Prediction

### Mammogram Prediction

-   **POST** `/predict`
-   **Headers**:
    -   `Authorization: Bearer <token>`
-   **Body**: `multipart/form-data` with `file` (image).
-   **Description**: Classifies mammogram as Benign or Malignant. Saves result to database.
-   **Response**:
    ```json
    {
      "prediction": "Malignant",
      "confidence": 0.95,
      "image_url": "...",
      "raw_output": [...]
    }
    ```

### Ultrasound Segmentation

-   **POST** `/ultrasound`
-   **Headers**:
    -   `Authorization: Bearer <token>`
-   **Body**: `multipart/form-data` with `file` (image).
-   **Description**: Segment tumor regions in ultrasound images. Saves result to database.
-   **Response**:
    ```json
    {
    	"type": "ultrasound",
    	"prediction": "Potential Abnormality Detected",
    	"tumor_detected": true,
    	"confidence": 0.88,
    	"mask_image": "data:image/png;base64,...",
    	"image_url": "..."
    }
    ```

### Ultrasound Re-evaluation

-   **POST** `/ultrasound/reevaluate`
-   **Headers**:
    -   `Content-Type: application/json`
    -   _(Optional)_ `Authorization: Bearer <token>`
-   **Body**:
    ```json
    {
    	"image_url": "https://..."
    }
    ```
-   **Description**: Re-runs the ultrasound model on an existing image URL. **Does not save** the result to the database. Used for interactive overlay visualization.
-   **Response**:
    ```json
    {
    	"type": "ultrasound",
    	"prediction": "Potential Abnormality Detected",
    	"tumor_detected": true,
    	"confidence": 0.88,
    	"mask_image": "data:image/png;base64,...",
    	"image_url": "..."
    }
    ```

## Data Management

### Delete Scan

-   **DELETE** `/scans/<scan_id>`
-   **Headers**:
    -   `Authorization: Bearer <token>`
-   **Description**: Permanently deletes a scan record and its associated image from storage.
