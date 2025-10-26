from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import os

app = FastAPI()

# Permitir cualquier origen (útil para pruebas y n8n)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



model = whisper.load_model("base")

@app.post("/transcribe/")
async def transcribe(file: UploadFile = File(...)):
    try:
        # Guardar archivo temporalmente como .ogg
        with tempfile.NamedTemporaryFile(delete=False, suffix=".ogg") as temp_audio:
            temp_audio.write(await file.read())
            temp_audio_path = temp_audio.name

        result = model.transcribe(temp_audio_path)
        os.remove(temp_audio_path)
        return {"text": result["text"]}
    except Exception as e:
        return {"error": str(e)}


