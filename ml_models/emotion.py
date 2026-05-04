import cv2
import numpy as np
from deepface import DeepFace

def analyze_video_emotion(image_file):
    """Takes an image file stream, reads it, and returns the dominant emotion."""
    try:
        # Convert the uploaded file to an OpenCV image format
        file_bytes = np.frombuffer(image_file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if img is None:
            return {"error": "Could not read image"}

        # Analyze emotion using DeepFace
        result = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False)
        
        # DeepFace returns a list of faces, we take the first one
        dominant_emotion = result[0]['dominant_emotion']
        
        return {
            "status": "success",
            "dominant_emotion": dominant_emotion,
            "all_emotions": result[0]['emotion']
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}