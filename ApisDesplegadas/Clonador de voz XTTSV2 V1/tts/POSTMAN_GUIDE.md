# Guía para Probar la API TTS con Postman

##  **Prerequisitos**
- Docker con la aplicación TTS corriendo
- Postman instalado (descarga desde [postman.com](https://www.postman.com/downloads/))
- Un archivo de audio de muestra (.wav, .mp3, etc.)

##  **Importar la Colección en Postman**

1. **Abrir Postman**
2. **Importar colección**:
   - Clic en "Import" (botón superior izquierdo)
   - Selecciona "File" 
   - Navega a `TTS_API_Postman_Collection.json`
   - Haz clic en "Import"

##  **Pruebas Paso a Paso**

### **1. Verificar que la API esté funcionando**

**Request: Health Check**
- **Método**: GET
- **URL**: `http://localhost:8000/health`
- **Respuesta esperada**:
```json
{
  "status": "healthy",
  "message": "TTS API is running"
}
```

### **2. Información de la API**

**Request: API Info**
- **Método**: GET
- **URL**: `http://localhost:8000/`
- **Respuesta esperada**:
```json
{
  "message": "TTS Voice Cloning API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "clone_voice": "/clonar_voz",
    "docs": "/docs"
  }
}
```

### **3. Test Simple**

**Request: Test Endpoint**
- **Método**: POST
- **URL**: `http://localhost:8000/test`
- **Respuesta esperada**:
```json
{
  "message": "API funcionando correctamente",
  "timestamp": 1751349969.6877346
}
```

### **4. Clonar Voz (Principal)**

**Request: Clonar Voz**
- **Método**: POST
- **URL**: `http://localhost:8000/clonar_voz`
- **Body**: Form-data
  - **Key**: `text` (Text)
  - **Value**: `"Hola, esta es una prueba de clonación de voz"`
  - **Key**: `audio` (File)
  - **Value**: Selecciona tu archivo de audio de referencia

**Respuestas posibles**:

 **Éxito con Google Drive**:
```json
{
  "success": true,
  "message": "Audio generado exitosamente",
  "drive_url": "https://drive.google.com/uc?id=FILE_ID&export=download",
  "file_id": "1A2B3C4D..."
}
```

 **Éxito sin Google Drive** (descarga directa):
- **Content-Type**: `audio/wav`
- **Body**: Archivo de audio generado

 **Error**:
```json
{
  "detail": "Descripción del error"
}
```

## 🎯 **Consejos para las Pruebas**

### **Archivos de Audio Recomendados**
- **Formato**: WAV, MP3
- **Duración**: 5-30 segundos
- **Calidad**: Clara, sin ruido de fondo
- **Contenido**: Voz humana hablando

### **Textos de Prueba**
```
1. "Hola, esta es una prueba de clonación de voz"
2. "Buenos días, espero que tengas un excelente día"
3. "La tecnología de síntesis de voz está avanzando rápidamente"
```

### **Códigos de Estado HTTP**
- **200**: ✅ Éxito
- **400**: ❌ Error en los datos enviados
- **503**: ❌ Servicio TTS no disponible
- **500**: ❌ Error interno del servidor

## 🔧 **Troubleshooting**

### **Error: Connection refused**
```bash
# Verificar que los servicios estén corriendo
docker-compose -f docker-compose.cpu.yml ps
```

### **Error: "Servicio TTS no disponible"**
```bash
# Ver logs del servicio Gradio
docker logs tts-tts-app-1 --tail=20
```

### **Error 400: "El archivo debe ser de audio"**
- Asegúrate de subir un archivo de audio válido
- Verifica que el Content-Type sea correcto

## 📱 **Interfaz Web Alternativa**

Si prefieres usar la interfaz web:
- **Gradio**: http://localhost:7860
- **FastAPI Docs**: http://localhost:8000/docs

## 📊 **Variables de Entorno**

En Postman, puedes crear variables:
- **{{base_url}}**: `http://localhost:8000`
- **{{text_sample}}**: `"Hola, esta es una prueba"`

## 🎬 **Ejemplo Completo con curl**

```bash
# Verificar salud
curl http://localhost:8000/health

# Clonar voz
curl -X POST \
  http://localhost:8000/clonar_voz \
  -H 'Content-Type: multipart/form-data' \
  -F 'text=Hola, esta es una prueba de clonación de voz' \
  -F 'audio=@/ruta/a/tu/archivo.wav'
```

¡Happy Testing! 🚀
