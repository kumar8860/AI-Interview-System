from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os, uuid, PyPDF2, json
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
        resume_text = "No resume provided by the candidate."
        
        if resume_file and resume_file.filename != '':
            try:
                reader = PyPDF2.PdfReader(resume_file)
                resume_text = " ".join([p.extract_text() for p in reader.pages if p.extract_text()])
            except Exception as pdf_error:
                print(f"Warning: Could not read PDF - {pdf_error}")
        
        if level == "Fresher":
            level_rules = (
                "CRITICAL FRESHER RULES:\n"
                "1. The candidate is a complete beginner.\n"
                "2. NEVER ask complex scenarios or system design.\n"
                "3. ONLY ask broad, fundamental definitions.\n"
                "4. NEVER ask multi-part questions."
            )
        elif level == "Intermediate":
            level_rules = "Candidate is Mid-Level. Ask about databases, API integrations, and moderate logic problems."
        else:
            level_rules = "Candidate is a Senior. Ask about system design, scalability, and complex trade-offs."

        system_msg = (
            f"You are a friendly Interviewer for the position of: '{role}'. "
            f"Candidate's level: {level}. Round: {mode}. "
            f"Resume Context: {resume_text[:1000]}... \n\n"
            f"INSTRUCTIONS:\n"
            f"1. Ask 50% of your questions about basic, standard skills for a {role}.\n"
            f"2. Ask 50% of your questions based on their resume.\n"
            f"{level_rules}\n"
            f"3. STRICT RULE: Your ENTIRE response must be 1 or 2 sentences MAXIMUM.\n"
            f"4. If you want to show a code example, wrap it in markdown (
```)."
        )
        
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": f"Generate a friendly opening question for a {level} {role} candidate. Max 2 sentences."}
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
            "level": level,
            "role": role 
        }
        
        return jsonify({"session_id": session_id, "question": first_q})
    
    except Exception as e:
        print(f"Error in /start: {str(e)}")
        return jsonify({"error": "Failed to start interview."}), 400

@app.route('/interview', methods=['POST'])
def interview():
    data = request.json
    sid = data.get("session_id")
    ans = data.get("answer", "")
    code = data.get("code", "")
    
    if not sid or sid not in sessions:
        return jsonify({"error": "Invalid session ID."}), 404
        
    session = sessions[sid]
    session["turns"] += 1
    
    is_final = session["turns"] >= 5 
    
    if is_final:
        user_input = (
            f"Candidate Answer: {ans} | Code: {code if code else 'Empty'}\n\n"
            "SYSTEM: This is the final turn. Say exactly: 'Thank you, that concludes our interview. I am compiling your results now.' DO NOT ask another question."
        )
    else:
        user_input = (
            f"Candidate Answer: {ans} | Code: {code if code else 'Empty'}\n\n"
            f"SYSTEM:\n"
            f"1. Acknowledge the candidate's answer briefly.\n"
            f"2. Ask ONE simple, broad question about a different topic for a {session['role']}.\n"
            f"3. Limit your reply to under 30 words."
        )

    session["messages"].append({"role": "user", "content": user_input})

    try:
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

# --- NEW: THE EVALUATION ENDPOINT ---
@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    sid = data.get("session_id")
    
    if not sid or sid not in sessions:
        return jsonify({"error": "Invalid session ID."}), 404
        
    session = sessions[sid]
    
    # Prompting the AI to return a strict JSON format
    eval_prompt = (
        "The interview is complete. Review the ENTIRE conversation above. "
        "Evaluate the candidate's technical accuracy, communication, and confidence. "
        "You MUST respond ONLY with a valid JSON object. Do not include markdown formatting or extra text. "
        "Use this EXACT structure:\n"
        "{\n"
        "  \"score\": <integer from 0 to 100>,\n"
        "  \"summary\": \"