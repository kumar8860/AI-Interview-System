import speech_recognition as sr

def transcribe_audio(file_path):
    recognizer = sr.Recognizer()

    try:
        with sr.AudioFile(file_path) as source:
            audio = recognizer.record(source)

        text = recognizer.recognize_google(audio)
        return text

    except sr.UnknownValueError:
        return "Could not understand audio"
    except Exception as e:
        print("Speech error:", e)
        return ""