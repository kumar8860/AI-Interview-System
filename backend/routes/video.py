from flask import Blueprint, request, jsonify
import cv2
import numpy as np
import base64

video_bp = Blueprint('video', __name__)

# Simple face detector (no heavy ML)
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

@video_bp.route('/analyze_video', methods=['POST'])
def analyze_video():
    data = request.get_json()
    image_data = data.get("image")

    # Decode base64 image
    img_bytes = base64.b64decode(image_data.split(",")[1])
    np_arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    # Simple logic (demo-level emotion)
    if len(faces) == 0:
        emotion = "no face detected"
    else:
        # Fake but useful heuristic
        brightness = np.mean(gray)

        if brightness > 150:
            emotion = "happy"
        elif brightness > 100:
            emotion = "neutral"
        else:
            emotion = "serious"

    return jsonify({
        "emotion": emotion
    })