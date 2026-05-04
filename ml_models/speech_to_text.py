import os
import tempfile
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def transcribe_audio(audio_file):
    """Converts audio to text using Groq's lightning-fast Whisper model."""
    try:
        # React audio blobs often come without proper extensions. 
        # Groq Whisper requires a valid audio extension to process it.
        # We save it temporarily, transcribe it, and delete it immediately.
        
        # Determine extension (default to webm as it is standard for web browsers)
        ext = ".webm"
        if audio_file.filename and '.' in audio_file.filename:
            ext = os.path.splitext(audio_file.filename)[1]
            
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name

        # Send to Groq Whisper for instant transcription
        with open(temp_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(temp_path), file.read()),
                model="whisper-large-v3",
                response_format="json",
                language="en" # Forces English. Remove this line if you want multi-language support.
            )
            
        # Clean up the temp file
        os.remove(temp_path)

        return {
            "status": "success",
            "transcription": transcription.text
        }
        
    except Exception as e:
        # Cleanup in case of error
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        return {"status": "error", "message": f"Whisper API Error: {str(e)}"}