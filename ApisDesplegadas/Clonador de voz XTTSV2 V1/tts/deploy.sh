#!/bin/bash
# Script para desplegar la aplicación TTS con Docker (CPU optimizado)

echo "🚀 Iniciando deployment de la aplicación TTS..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instálalo desde https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Instálalo desde https://docs.docker.com/compose/install/"
    exit 1
fi

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p outputs temp

# Verificar que existe credentials.json
if [ ! -f "credentials.json" ]; then
    echo "⚠️  Advertencia: No se encuentra credentials.json"
    echo "   Asegúrate de tener las credenciales de Google Drive configuradas"
fi

echo "🖥️  Usando configuración optimizada para CPU..."

# Construir la imagen Docker
echo "🔨 Construyendo la imagen Docker..."
docker-compose build

# Ejecutar la aplicación
echo "🎯 Iniciando los servicios..."
docker-compose up -d

echo "✅ Deployment completado!"
echo ""
echo "🌐 Accede a la aplicación en:"
echo "   - Interfaz Gradio: http://localhost:7860"
echo "   - API FastAPI: http://localhost:8000"
echo ""
echo "📊 Para ver los logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Para detener los servicios:"
echo "   docker-compose down"
