# Whisper API 

Esta es una API que utiliza OpenAI Whisper para transcribir archivos de audio.

# Versión dockerizada
## Prerrequisitos

- Docker
- Docker Compose

## Instrucciones de uso

### Opción 1: Usando Docker Compose (Recomendado)

1. Construir y ejecutar el contenedor:
```bash
docker-compose up --build
```

2. La API estará disponible en: `http://localhost:8001`

3. Para ejecutar en segundo plano:
```bash
docker-compose up -d --build
```

4. Para detener el servicio:
```bash
docker-compose down
```

### Opción 2: Usando Docker directamente

1. Construir la imagen:
```bash
docker build -t whisper-api .
```

2. Ejecutar el contenedor:
```bash
docker run -p 8001:8001 whisper-api
```


# Utilizando uvicorn

1. Crear un venv:
```bash
python -m venv venv
```

2. Activar el venv:
```bash
venv\Scripts\activate3. 
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Ejecutar la aplicación:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```


## Uso de la API

### Transcribir audio

Envía una petición POST a `/transcribe/` con un archivo de audio:

```bash
curl -X POST "http://localhost:8001/transcribe/" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@tu_archivo_audio.wav"
```

### Documentación interactiva

 `http://localhost:8001/docs` para ver la documentación interactiva de la API.

## Notas importantes

- El modelo Whisper se descarga automáticamente la primera vez que se ejecuta
- Los modelos se almacenan en un volumen Docker para evitar descargas repetidas
- La aplicación acepta varios formatos de audio: WAV, MP3, OGG, M4A, FLAC, etc.
- El contenedor incluye ffmpeg para el procesamiento de audio

## Configuración

- Puerto: 8001 (configurable en docker-compose.yml)
- Modelo Whisper: "base" (configurable en whisper_api.py)
- CORS habilitado para todos los orígenes
