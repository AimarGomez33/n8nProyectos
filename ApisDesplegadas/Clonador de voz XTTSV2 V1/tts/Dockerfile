# Dockerfile optimizado para CPU únicamente
FROM python:3.11-bookworm

# Evitar prompts interactivos durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    wget \
    curl \
    ffmpeg \
    espeak-ng \
    espeak-ng-data \
    libsndfile1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar requirements.txt primero (para mejor cache de Docker)
COPY requirements.txt .

# Actualizar pip e instalar dependencias
RUN python -m pip install --upgrade pip

# Instalar PyTorch CPU-only (más rápido y menor tamaño)
RUN pip install --no-cache-dir \
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
    torch torchvision torchaudio
    

# Instalar otras dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Crear directorios necesarios
RUN mkdir -p /app/outputs /app/temp

# Exponer el puerto que usa Gradio
EXPOSE 7860

# Variables de entorno optimizadas para CPU
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV OMP_NUM_THREADS=4
ENV MKL_NUM_THREADS=4

# Comando para ejecutar la aplicación
CMD ["python", "main.py"]
