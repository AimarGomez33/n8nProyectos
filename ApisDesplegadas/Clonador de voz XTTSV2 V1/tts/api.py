from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import uuid
import os
import time
import requests
from time import sleep

from gradio_client import Client, handle_file
from drive_upload import upload_file, hacer_publico_y_obtener_url
from auth import authenticate

app = FastAPI(title="TTS Voice Cloning API", version="1.0.0")

# Configurar CORS para permitir peticiones desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def check_gradio_service(url="http://tts-app:7860/", retries=5, delay=2):
    """
    Verifica que el servicio de Gradio esté disponible
    
    - **url**: URL del servicio de Gradio
    - **retries**: Número de reintentos en caso de fallo
    - **delay**: Delay entre reintentos (en segundos)
    """
    for i in range(retries):
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return True
        except requests.ConnectionError:
            pass
        sleep(delay)
    return False

def wait_for_gradio_service(max_retries=30, delay=2):
    """
    Espera a que el servicio Gradio esté disponible
    """
    gradio_url = "http://tts-app:7860/"
    
    for attempt in range(max_retries):
        try:
            response = requests.get(gradio_url, timeout=5)
            if response.status_code == 200:
                print(f"✅ Servicio Gradio disponible en {gradio_url}")
                return True
        except requests.exceptions.RequestException:
            print(f"⏳ Intento {attempt + 1}/{max_retries}: Esperando servicio Gradio...")
            sleep(delay)
    
    print(f"❌ Servicio Gradio no disponible después de {max_retries} intentos")
    return False

@app.post("/clonar_voz") 
async def clonar_voz(text: str = Form(...), audio: UploadFile = Form(...)):
    """
    Clona una voz usando el archivo de audio de referencia
    
    - **text**: Texto que se convertirá a audio con la voz clonada
    - **audio**: Archivo de audio de referencia (.wav recomendado)
    """
    print(f"📝 Recibiendo solicitud de clonación de voz con texto: '{text[:50]}...'")
    
    try:
        # Validar que es un archivo de audio
        if not audio.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="El archivo debe ser de audio")
        
        print(f"🎵 Archivo de audio recibido: {audio.filename}, tipo: {audio.content_type}")
        # 1. Guardar archivo temporal
        temp_dir = "temp"
        os.makedirs(temp_dir, exist_ok=True)
        temp_audio_path = os.path.join(temp_dir, f"{uuid.uuid4()}.wav")

        with open(temp_audio_path, "wb") as f:
            shutil.copyfileobj(audio.file, f)

        print(f"💾 Archivo temporal guardado en: {temp_audio_path}")
        # 2. Enviar al cliente de Gradio
        try:
            print("🔗 Intentando conectar con el servicio Gradio...")
            
            # Verificar que el servicio Gradio esté disponible
            if not wait_for_gradio_service(max_retries=3, delay=1):
                raise HTTPException(status_code=503, detail="Servicio TTS no está disponible")
            
            # En Docker, usar el nombre del servicio en lugar de localhost
            print("🎯 Conectando con Gradio en http://tts-app:7860/")
            client = Client("http://tts-app:7860/")
            audio_file = handle_file(temp_audio_path)
            
            print("🚀 Enviando solicitud a Gradio...")
            result_path = client.predict(
                text=text,
                speaker_wav=audio_file,
                api_name="/predict"
            )
            print(f"✅ Audio generado exitosamente: {result_path}")
        except Exception as e:
            print(f"❌ Error en servicio Gradio: {str(e)}")
            raise HTTPException(status_code=503, detail=f"Servicio TTS no disponible: {str(e)}")

        # 3. Subir a Google Drive (opcional)
        try:
            creds = authenticate()
            file_id = upload_file(creds, result_path)
            public_url = hacer_publico_y_obtener_url(creds, file_id)
            
            # 4. Limpiar archivos temporales
            os.remove(temp_audio_path)
            
            return JSONResponse(content={
                "success": True,
                "message": "Audio generado exitosamente",
                "drive_url": public_url,
                "file_id": file_id
            })
        except Exception as e:
            # Si falla Google Drive, devolver el archivo directamente
            return FileResponse(
                result_path, 
                media_type='audio/wav',
                filename=f"audio_clonado_{int(time.time())}.wav"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/health")
async def health_check():
    """Endpoint de salud para verificar que la API está funcionando"""
    return {"status": "healthy", "message": "TTS API is running"}

@app.get("/gradio-status")
async def gradio_status():
    """Verifica el estado del servicio Gradio"""
    try:
        if wait_for_gradio_service(max_retries=1, delay=0):
            return {"status": "available", "message": "Servicio Gradio disponible"}
        else:
            return {"status": "unavailable", "message": "Servicio Gradio no disponible"}
    except Exception as e:
        return {"status": "error", "message": f"Error verificando Gradio: {str(e)}"}

@app.get("/")
async def root():
    """Endpoint raíz con información de la API"""
    return {
        "message": "TTS Voice Cloning API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "clone_voice": "/clonar_voz",
            "docs": "/docs"
        }
    }

@app.post("/test")
async def test_endpoint():
    """Endpoint simple para probar que la API funciona"""
    return {"message": "API funcionando correctamente", "timestamp": time.time()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
