import torch
import os
import time
import uuid
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# --- Añadir las clases necesarias para la deserialización segura ---
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import XttsAudioConfig, XttsArgs
from TTS.config.shared_configs import BaseDatasetConfig

# Esto es necesario desde PyTorch 2.6+ por motivos de seguridad
torch.serialization.add_safe_globals([XttsConfig, XttsAudioConfig, BaseDatasetConfig, XttsArgs])

from TTS.api import TTS

# --- Configuración inicial ---
device = "cpu"
print(f"Usando dispositivo: {device}")
model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
# Crear el directorio de salida si no existe
output_dir = os.path.join(os.getcwd(), "outputs")
os.makedirs(output_dir, exist_ok=True)

# Crear directorio temporal si no existe
temp_dir = os.path.join(os.getcwd(), "temp")
os.makedirs(temp_dir, exist_ok=True)

# --- Cargar el modelo una sola vez al inicio ---
print("Cargando el modelo TTS. Esto puede tardar un momento...")
# La advertencia sobre GPT2InferenceModel es normal, puedes ignorarla.

# Configurar variables de entorno para aceptar términos automáticamente
os.environ["COQUI_TOS_AGREED"] = "1"

try:
    tts = TTS(model_name=model_name, progress_bar=True, gpu=False)
    print(" Modelo TTS cargado exitosamente usando CPU.")
except Exception as e:
    print(f" Error cargando el modelo TTS: {e}")
    print("Intentando cargar el modelo sin progress bar...")
    try:
        tts = TTS(model_name=model_name, progress_bar=False, gpu=False)
        print(" Modelo TTS cargado exitosamente usando CPU (sin progress bar).")
    except Exception as e2:
        print(f" Error crítico cargando el modelo TTS: {e2}")
        raise e2

# Crear la aplicación FastAPI
app = FastAPI(title="TTS Voice Cloning API", description="API para clonación de voz usando X-TTS")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def generate_audio(text: str, speaker_wav_path: str):
    """Genera audio con voz clonada"""
    if not text or not speaker_wav_path:
        raise HTTPException(status_code=400, detail="Se requiere texto y archivo de audio de referencia")
    
    unique_audio_path = os.path.join(output_dir, f"output_{int(time.time())}.wav")
    
    print(f"Generando audio para el texto: '{text}'")
    
    try:
        tts.tts_to_file(
            text=text,
            file_path=unique_audio_path,
            speaker_wav=speaker_wav_path,
            language="es"
        )
        
        print(f"Audio generado y guardado en: {unique_audio_path}")
        return unique_audio_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando audio: {str(e)}")

@app.post("/clone-voice/")
async def clone_voice(
    text: str = Form(..., description="Texto a sintetizar"),
    audio_file: UploadFile = File(..., description="Archivo de audio de referencia para clonar voz")
):
    """
    Endpoint para clonar voz.
    - **text**: El texto que se quiere sintetizar
    - **audio_file**: Archivo de audio de referencia (WAV recomendado)
    """
    
    # Validar que es un archivo de audio
    if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="El archivo debe ser de audio")
    
    # Guardar el archivo temporal
    temp_filename = f"{uuid.uuid4()}.wav"
    temp_filepath = os.path.join(temp_dir, temp_filename)
    
    try:
        # Escribir el archivo subido al disco
        with open(temp_filepath, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)
        
        # Generar el audio con voz clonada
        output_path = await generate_audio(text, temp_filepath)
        
        # Retornar el archivo generado
        return FileResponse(
            path=output_path,
            media_type='audio/wav',
            filename=f"voice_cloned_{int(time.time())}.wav"
        )
        
         
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando archivo: {str(e)}")
    
    finally:
        # Limpiar archivo temporal
        if os.path.exists(temp_filepath):
            try:
                os.remove(temp_filepath)
            except:
                pass
            

@app.get("/")
async def root():
    """Endpoint de información básica"""
    return {
        "message": "TTS Voice Cloning API",
        "description": "API para clonación de voz usando X-TTS Desarrolado por @AimarJairGomezDaniel. Coqui TTS contributors. TTS: Text-to-Speech for modern deep learning. GitHub. https://github.com/coqui-ai/TTS",
        "endpoints": {
            "/clone-voice/": "POST - Clonar voz con texto y archivo de audio",
            "/docs": "Documentación interactiva de la API"
        }
    }

@app.get("/health")
async def health_check():
    """Endpoint de verificación de salud"""
    try:
        # Verificar que el modelo TTS esté cargado
        if tts is None:
            return {"status": "unhealthy", "reason": "TTS model not loaded"}
        
        return {
            "status": "healthy",
            "model": model_name,
            "device": device,
            "timestamp": int(time.time())
        }
    except Exception as e:
        return {"status": "unhealthy", "reason": str(e)}


if __name__ == "__main__":
    # Lanzar la aplicación FastAPI
    # Usar 0.0.0.0 para que sea accesible desde fuera del contenedor
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
    
        