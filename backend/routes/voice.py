# Voice interview API will be implemented here

from flask import Blueprint, request, jsonify
from ml_models.model import predict_answer

voice_bp = Blueprint('voice', __name__)

@voice_bp.route('/voice', methods=['POST'])
def voice_interview():
    data = request.get_json()
    text = data.get("text")

    answer = predict_answer(text)

    return jsonify({
        "answer": answer,
        "score": 7
    })