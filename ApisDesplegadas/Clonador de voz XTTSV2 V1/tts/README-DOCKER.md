# 🎤 TTS Voice Cloning App - Docker Deployment

Esta aplicación permite clonar voces usando X-TTS y está containerizada con Docker para facilitar su deployment.

## 🚀 Deployment Rápido

### Requisitos Previos
- Docker y Docker Compose instalados
- CPU con al menos 4 núcleos (recomendado)
- 8GB RAM mínimo (16GB recomendado)
- Credenciales de Google Drive API (archivo `credentials.json`)

### Instalación

1. **Clona o descarga el proyecto**
```bash
cd /ruta/a/tu/proyecto
```

2. **Configura las credenciales de Google Drive** (opcional)
   - Coloca tu archivo `credentials.json` en el directorio raíz del proyecto
   - Si no tienes credenciales, la aplicación funcionará sin subida automática a Drive

3. **Ejecuta el script de deployment**

En Windows:
```cmd
deploy.bat
```

En Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

### Acceso a la Aplicación

Una vez desplegada, puedes acceder a:

- **Interfaz Gradio**: http://localhost:7860
- **API FastAPI**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

## 🔧 Comandos Docker Útiles

### Deployment según tu hardware

**Para CPU (recomendado si no tienes ROCm):**
```bash
docker-compose -f docker-compose.cpu.yml up -d
```

**Para GPU AMD con ROCm:**
```bash
docker-compose -f docker-compose.amd.yml up -d
```

**Para desarrollo (configuración básica):**
```bash
docker-compose up -d
```

### Ver logs en tiempo real
```bash
docker-compose logs -f
```

### Detener los servicios
```bash
docker-compose down
```

### Rebuilding después de cambios
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Ejecutar solo la interfaz Gradio
```bash
docker-compose up tts-app
```

### Ejecutar solo la API
```bash
docker-compose up tts-api
```

## 📁 Estructura del Proyecto

```
tts/
├── main.py              # Aplicación principal Gradio
├── api.py               # API FastAPI
├── auth.py              # Autenticación Google Drive
├── drive_upload.py      # Subida a Google Drive
├── cliente.py           # Cliente de prueba
├── requirements.txt     # Dependencias Python
├── Dockerfile           # Configuración Docker
├── docker-compose.yml   # Orchestration de servicios
├── deploy.sh           # Script deployment Linux/Mac
├── deploy.bat          # Script deployment Windows
├── .dockerignore       # Archivos ignorados por Docker
├── credentials.json    # Credenciales Google Drive (no incluido)
├── outputs/            # Archivos de audio generados
└── temp/               # Archivos temporales
```

## 🔧 Configuración Avanzada

### Variables de Entorno

Puedes crear un archivo `.env` basado en `.env.example` para personalizar la configuración:

```bash
cp .env.example .env
```

### GPU Support

El docker-compose.yml está configurado para usar GPU NVIDIA. Si no tienes GPU, comenta la sección `deploy.resources` en el archivo.

### Personalización de Puertos

Modifica los puertos en `docker-compose.yml`:
```yaml
ports:
  - "PUERTO_EXTERNO:PUERTO_INTERNO"
```

## 🐛 Troubleshooting

### Error: "ROCm not found" 
- Si tienes GPU AMD pero no ROCm, usa: `docker-compose -f docker-compose.cpu.yml up -d`
- Para instalar ROCm: https://rocmdocs.amd.com/en/latest/deploy/linux/quick_start.html

### Error: "CUDA not available"
- Normal con GPU AMD, la aplicación funcionará con CPU/ROCm según tu configuración
- Verifica que uses el docker-compose correcto para tu hardware

### Error: "Port already in use"
- Cambia los puertos en `docker-compose.yml`
- O detén otros servicios que usen los puertos 7860/8000

### Problemas con Google Drive
- Verifica que `credentials.json` esté presente
- Ejecuta `python auth.py` localmente para generar `token.json`

### Memory Issues
- Reduce el batch size o usa GPU más potente
- Monitorea el uso de memoria con: `docker stats`

## 📝 API Usage

### Endpoint para clonar voz
```bash
curl -X POST "http://localhost:8000/clonar_voz" \
     -F "text=Hola, esta es una prueba" \
     -F "audio=@ruta/al/archivo.wav"
```

### Response
```json
{
  "url": "https://drive.google.com/uc?id=FILE_ID&export=download"
}
```

## 🔄 Updates

Para actualizar la aplicación:
1. Actualiza el código
2. Rebuilding: `docker-compose build --no-cache`
3. Restart: `docker-compose up -d`
