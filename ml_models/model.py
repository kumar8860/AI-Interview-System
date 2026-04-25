import re
import numpy as np

# -------------------------------
# 🧠 TEXT CLEANING
# -------------------------------
def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return text


# -------------------------------
# 🎯 CONFIDENCE DETECTION (TEXT-BASED)
# -------------------------------
def analyze_confidence(answer):
    text = clean_text(answer)

    words = text.split()
    word_count = len(words)

    # filler words detection
    fillers = ["um", "uh", "like", "you know", "actually", "basically"]
    filler_count = sum([text.count(f) for f in fillers])

    # sentence strength
    strong_words = ["definitely", "confident", "experience", "achieved", "built"]
    strong_count = sum([text.count(w) for w in strong_words])

    # hesitation phrases
    hesitation = ["i think", "maybe", "not sure", "i guess"]
    hesitation_count = sum([text.count(h) for h in hesitation])

    # -------------------------------
    # 📊 SCORE CALCULATION
    # -------------------------------
    score = 5  # base

    # length factor
    if word_count > 20:
        score += 2
    elif word_count < 5:
        score -= 2

    # filler penalty
    score -= filler_count * 0.5

    # hesitation penalty
    score -= hesitation_count * 1

    # strong words boost
    score += strong_count * 0.5

    # clamp score
    score = max(1, min(10, round(score)))

    # -------------------------------
    # 🧾 LABEL
    # -------------------------------
    if score >= 8:
        level = "High Confidence"
    elif score >= 5:
        level = "Moderate Confidence"
    else:
        level = "Low Confidence"

    return score, level


# -------------------------------
# 🧠 OVERALL SCORING
# -------------------------------
def calculate_score(answer):
    confidence_score, _ = analyze_confidence(answer)

    # basic quality check
    length_bonus = min(len(answer.split()) / 10, 3)

    final_score = confidence_score + length_bonus
    final_score = max(1, min(10, round(final_score)))

    return final_score


# -------------------------------
# 💬 FEEDBACK GENERATION
# -------------------------------
def generate_feedback(answer):
    confidence_score, level = analyze_confidence(answer)

    feedback = []

    if level == "High Confidence":
        feedback.append("You sound confident and clear.")
    elif level == "Moderate Confidence":
        feedback.append("Your answer is decent but can be more confident.")
    else:
        feedback.append("You seem unsure. Try to speak more confidently.")

    if len(answer.split()) < 10:
        feedback.append("Try to elaborate your answer more.")

    if any(word in answer.lower() for word in ["um", "uh", "like"]):
        feedback.append("Avoid filler words to sound more professional.")

    return {
        "confidence_score": confidence_score,
        "confidence_level": level,
        "feedback": feedback
    }