# Clonador de Voz con XTTS-V2

API basada en FastAPI para la clonación de voz en tiempo real utilizando el modelo XTTS-V2 de Coqui TTS.

## Descripción

Este proyecto expone un endpoint de API que permite sintetizar texto a voz utilizando una muestra de audio como referencia para clonar el timbre de voz. La API está construida con FastAPI y utiliza la biblioteca `TTS` de Coqui.

## Características

- **Clonación de Voz**: Endpoint para clonar una voz a partir de un archivo de audio y un texto.
- **Soporte para CPU**: Configurado para ejecutarse en CPU, haciéndolo accesible en una amplia gama de hardware.
- **API Asíncrona**: Construido con FastAPI para un alto rendimiento.
- **CORS Habilitado**: Permite peticiones desde cualquier origen.
- **health check**: Incluye un endpoint `/health` para monitorear el estado de la API y el modelo.
   
## Requisitos Previos

- python 3.11(Obligatorio)
- `pip` para la gestión de paquetes


## Instalación


1. **Crear un entorno virtual:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # En Windows: .venv\Scripts\activate
   ```

2. **Instalar las dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

## Uso

1. **Iniciar el servidor:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   El servidor estará disponible en `http://localhost:8000`.

2. **Acceder a la documentación de la API:**
   Para ver la documentación interactiva de Swagger, abre tu navegador y ve a `http://localhost:8000/docs`.

3. **Ejemplo de uso con `curl`:**
   Puedes clonar una voz enviando una petición `POST` al endpoint `/clone-voice/` con un archivo de audio y el texto a sintetizar.

   ```bash
   curl -X POST "http://localhost:8000/clone-voice/"
        -H "accept: application/json"
        -H "Content-Type: multipart/form-data"
        -F "text=Hola, este es un mensaje de prueba con mi voz clonada."
        -F "audio_file=@/ruta/a/tu/archivo.wav" --output audio_clonado.wav
   ```

## API Endpoints

### `POST /clone-voice/`

Clona una voz y sintetiza el texto proporcionado.

- **Parámetros (form-data):**
  - `text` (str): El texto a sintetizar.
  - `audio_file` (UploadFile): El archivo de audio de referencia para la clonación (se recomienda formato WAV).

- **Respuesta:**
  - Un archivo de audio en formato `audio/wav` con el discurso sintetizado.

### `GET /health`

Verifica el estado de la API y del modelo TTS.

- **Respuesta (JSON):**
  ```json
  {
    "status": "healthy",
    "model": "tts_models/multilingual/multi-dataset/xtts_v2",
    "device": "cpu",
    "timestamp": 1678886400
  }
  ```

### `GET /`

Muestra información básica sobre la API.

- **Respuesta (JSON):**
  ```json
  {
    "message": "TTS Voice Cloning API",
    "description": "API para clonación de voz usando X-TTS...",
    "endpoints": {
      "/clone-voice/": "POST - Clonar voz con texto y archivo de audio",
      "/docs": "Documentación interactiva de la API"
    }
  }
  ```

## Estructura del Proyecto

```
.
├── main.py            # Lógica principal de la API FastAPI y el modelo TTS
├── requirements.txt   # Dependencias de Python
├── outputs/           # Directorio donde se guardan los audios generados
├── temp/              # Directorio para archivos de audio temporales
└── README.md          # Este archivo
```

## Trabajo original

Coqui TTS contributors. TTS: Text-to-Speech for modern deep learning. GitHub. https://github.com/coqui-ai/TTS
