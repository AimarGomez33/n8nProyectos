# Usar una imagen base de Python con ffmpeg preinstalado
FROM python:3.10-slim

# Instalar dependencias del sistema necesarias para whisper y audio
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar requirements.txt primero para aprovechar el cache de Docker
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY whisper_api.py .

# Exponer el puerto que usa la aplicación
EXPOSE 8001

# Comando para ejecutar la aplicación
CMD ["uvicorn", "whisper_api:app", "--host", "0.0.0.0", "--port", "8001"]
