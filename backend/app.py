import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Local AI (your model)
from ml_models.model import predict_answer
from ml_models.emotion import analyze_voice

# -------- INIT --------
app = Flask(__name__)
CORS(app)

# -------- MEMORY --------
conversation_history = []

# -------- HOME --------
@app.route('/')
def home():
    return "✅ Backend is running"

# -------- START INTERVIEW --------
@app.route('/start', methods=['POST'])
def start():
    data = request.get_json() or {}
    role = data.get("role", "hr")

    if role == "sde":
        first_question = "Explain your favorite data structure."
    elif role == "data_analyst":
        first_question = "Explain a project where you used SQL or Python."
    else:
        first_question = "Tell me about yourself."

    conversation_history.clear()
    conversation_history.append({"question": first_question})

    return jsonify({"question": first_question})

# -------- LOCAL AI FUNCTION --------
def ask_ai(answer):
    # Generate next question using local model
    next_q = predict_answer(answer)

    conversation_history.append({
        "answer": answer,
        "next_question": next_q
    })

    return next_q

# -------- INTERVIEW --------
@app.route('/interview', methods=['POST'])
def interview():

    data = request.get_json() or {}
    answer = data.get("answer", "")

    # AI next question
    next_question = ask_ai(answer)

    # Voice analysis
    analysis = analyze_voice(answer)

    return jsonify({
        "next_question": next_question,
        "analysis": analysis
    })

# -------- DEBUG --------
@app.route('/routes')
def routes():
    return str(app.url_map)

# -------- RUN --------
if __name__ == '__main__':
    print("🚀 Backend starting...")
    print(app.url_map)
    app.run(debug=True)