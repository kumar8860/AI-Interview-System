from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# -------- YOUR API KEY --------
OPENAI_API_KEY = "YOUR_API_KEY_HERE"

# -------- MEMORY --------
conversation_history = []


# -------- START INTERVIEW --------
@app.route('/start', methods=['POST'])
def start():
    data = request.get_json()
    role = data.get("role", "general")

    system_prompt = ""

    if role == "sde":
        system_prompt = "You are a strict technical interviewer for software engineering roles. Ask deep technical questions and follow-ups."
        first_question = "Introduce yourself as a software developer."
    elif role == "data_analyst":
        system_prompt = "You are a data analyst interviewer. Focus on SQL, Python, statistics, and projects."
        first_question = "Tell me about your data analysis experience."
    else:
        system_prompt = "You are a professional HR interviewer. Ask behavioral and communication questions."
        first_question = "Tell me about yourself."

    conversation_history.clear()

    conversation_history.append({
        "role": "system",
        "content": system_prompt
    })

    conversation_history.append({
        "role": "assistant",
        "content": first_question
    })

    return jsonify({"question": first_question})


# -------- GPT CALL --------
def ask_gpt(user_answer):
    conversation_history.append({
        "role": "user",
        "content": user_answer
    })

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-4o-mini",
            "messages": conversation_history,
            "temperature": 0.7
        }
    )

    result = response.json()

    ai_reply = result["choices"][0]["message"]["content"]

    conversation_history.append({
        "role": "assistant",
        "content": ai_reply
    })

    return ai_reply


# -------- SCORE --------
def calculate_score(answer):
    words = len(answer.split())

    if words > 30:
        return 9
    elif words > 15:
        return 7
    return 5


# -------- CONFIDENCE --------
def confidence_level(answer):
    if "confident" in answer.lower():
        return "High"
    if "maybe" in answer.lower() or "i think" in answer.lower():
        return "Medium"
    return "Low"


# -------- INTERVIEW --------
@app.route('/interview', methods=['POST'])
def interview():
    data = request.get_json()
    answer = data.get("answer", "")

    next_question = ask_gpt(answer)

    score = calculate_score(answer)
    confidence = confidence_level(answer)

    return jsonify({
        "next_question": next_question,
        "score": score,
        "confidence": confidence
    })


if __name__ == '__main__':
    app.run(debug=True)