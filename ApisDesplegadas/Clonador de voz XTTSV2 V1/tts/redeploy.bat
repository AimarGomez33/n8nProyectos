@echo off
echo Reconstruyendo y desplegando la aplicación TTS...

echo Deteniendo contenedores existentes...
docker-compose down

echo Eliminando imágenes antiguas...
docker rmi tts_tts-app tts_tts-api 2>nul

echo Construyendo nuevas imágenes...
docker-compose build --no-cache

echo Iniciando servicios...
docker-compose up -d

echo Esperando que los servicios estén listos...
timeout /t 10

echo Estado de los contenedores:
docker-compose ps

echo Deployment completado!
echo API disponible en: http://localhost:8000
echo Gradio disponible en: http://localhost:7860
echo Documentación API: http://localhost:8000/docs
echo.
echo Para producción, usa: docker-compose -f docker-compose.prod.yml up -d

pause
