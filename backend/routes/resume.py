from flask import Blueprint, request, jsonify
import PyPDF2
from openai import OpenAI

resume_bp = Blueprint('resume', __name__)
client = OpenAI()

resume_text = ""

# ---- EXTRACT TEXT FROM PDF ----
def extract_text(file):
    reader = PyPDF2.PdfReader(file)
    text = ""

    for page in reader.pages:
        text += page.extract_text()

    return text


# ---- UPLOAD RESUME ----
@resume_bp.route('/upload_resume', methods=['POST'])
def upload_resume():
    global resume_text

    file = request.files['file']
    resume_text = extract_text(file)

    return jsonify({"message": "Resume uploaded successfully"})


# ---- GENERATE QUESTIONS FROM RESUME ----
def generate_resume_questions(answer_history):
    prompt = f"""
    You are an AI interviewer.

    Candidate Resume:
    {resume_text}

    Conversation so far:
    {answer_history}

    Ask a relevant interview question based on resume and previous answers.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content