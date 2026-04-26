from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os, uuid, PyPDF2
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
sessions = {}

@app.route('/start', methods=['POST'])
def start():
    role = request.form.get("role", "Software Engineer")
    level = request.form.get("level", "Fresher") 
    mode = request.form.get("mode", "Technical")
    
    try:
        resume_file = request.files.get("resume")
        reader = PyPDF2.PdfReader(resume_file)
        resume_text = " ".join([p.extract_text() for p in reader.pages if p.extract_text()])
        
        if level == "Fresher":
            level_rules = (
                "ABSOLUTE STRICT RULE: The candidate is a complete beginner. "
                "NEVER ask about concurrency, scalability, microservices, or system design. "
                "ONLY ask fundamental 101-level questions: e.g., 'What is a for-loop?', 'How do you reverse a string?', or 'Explain an array.' "
                "Keep the verbal part under 20 words."
            )
        elif level == "Intermediate":
            level_rules = "Candidate is Mid-Level. Ask about databases, API integrations, and moderate logic problems. Max 20 words."
        else:
            level_rules = "Candidate is a Senior. Ask about system design, scalability, and complex trade-offs. Max 20 words."

        system_msg = (
            f"You are a human-like Interviewer. Role: {role}. Level: {level}. Round: {mode}. "
            f"Context: {resume_text}. "
            f"INSTRUCTIONS: 1. {level_rules} "
            "2. If you want to show a code example, YOU MUST wrap it in standard markdown (```). "
            "3. Do not verbally explain the syntax line-by-line. Let the code speak for itself."
        )
        
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": f"Generate a friendly, very simple opening question for a {level} candidate."}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.4 
        )
        first_q = completion.choices[0].message.content.strip()
        
        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            "messages": [{"role": "system", "content": system_msg}, {"role": "assistant", "content": first_q}],
            "turns": 0,
            "mode": mode,
            "level": level
        }
        return jsonify({"session_id": session_id, "question": first_q})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/interview', methods=['POST'])
def interview():
    data = request.json
    sid = data.get("session_id")
    ans = data.get("answer", "")
    code = data.get("code", "")
    
    session = sessions[sid]
    session["turns"] += 1
    
    user_input = f"Candidate Voice Answer: {ans} | Code in Editor: {code if code else 'Empty'}"
    session["messages"].append({"role": "user", "content": user_input})

    try:
        is_final = session["turns"] >= 7
        completion = client.chat.completions.create(
            messages=session["messages"],
            model="llama-3.1-8b-instant",
            temperature=0.4 
        )
        reply = completion.choices[0].message.content.strip()
        session["messages"].append({"role": "assistant", "content": reply})
        
        return jsonify({"next_question": reply, "is_final": is_final})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)