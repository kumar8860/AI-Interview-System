# ml_models/utils.py

import re

# Predefined skill keywords (can expand later)
SKILL_DB = [
    "python", "java", "c++", "machine learning", "deep learning",
    "data analysis", "sql", "mongodb", "react", "flask", "django",
    "nlp", "computer vision", "html", "css", "javascript"
]

def extract_skills(text):
    text = text.lower()
    found_skills = []

    for skill in SKILL_DB:
        if skill in text:
            found_skills.append(skill.title())

    return list(set(found_skills))


def generate_questions(skills):
    questions = []

    for skill in skills:
        questions.append(f"Explain your experience with {skill}")
        questions.append(f"What projects have you done using {skill}?")

    if not questions:
        questions.append("Tell me about your technical skills")

    return questions