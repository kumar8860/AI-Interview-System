def analyze_voice(text):
    confidence = "Medium"

    if len(text) > 50:
        confidence = "High"

    return {
        "confidence": confidence,
        "tone": "Neutral"
    }