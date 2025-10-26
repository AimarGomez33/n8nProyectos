@echo off
echo Desplegando aplicación TTS en modo PRODUCCIÓN...

echo  Deteniendo contenedores existentes...
docker-compose -f docker-compose.prod.yml down

echo  Eliminando imagenes antiguas...
docker rmi tts_tts-app tts_tts-api tts_nginx 2>nul

echo   Construyendo nuevas imagenes...
docker-compose -f docker-compose.prod.yml build --no-cache

echo  Iniciando servicios en produccion...
docker-compose -f docker-compose.prod.yml up -d

echo  Esperando que los servicios estén listos...
timeout /t 15

echo  Estado de los contenedores:
docker-compose -f docker-compose.prod.yml ps

echo  Deployment de PRODUCCIÓN completado!
echo  Aplicacion disponible en: http://localhost (puerto 80)
echo  HTTPS disponible en: https://localhost (puerto 443)
echo  Gradio directo: http://localhost:7860
echo  API directa: http://localhost:8000
echo  Documentación API: http://localhost:8000/docs

pause
