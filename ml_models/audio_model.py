import numpy as np
import librosa

def predict_confidence_from_audio(file_path):
    try:
        y, sr = librosa.load(file_path, sr=None)

        # ---- FEATURE EXTRACTION ----
        energy = np.mean(librosa.feature.rms(y=y))
        pitch = np.mean(librosa.yin(y, fmin=50, fmax=300))

        # ---- SIMPLE ML LOGIC ----
        if energy > 0.02 and pitch > 120:
            return "High"
        elif energy > 0.01:
            return "Medium"
        else:
            return "Low"

    except Exception as e:
        print("Audio error:", e)
        return "Unknown"