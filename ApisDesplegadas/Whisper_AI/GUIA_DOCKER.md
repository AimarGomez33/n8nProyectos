# Guía rápida: Crear Dockerfile y docker-compose.yml 


## . Ejemplo básico de Dockerfile para aplicaciones Python

```dockerfile
# Usa una imagen base oficial de Python
FROM python:3.10-slim

# Instala dependencias del sistema (opcional)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias primero (mejor cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código
COPY . .

# Expone el puerto de la app (ajusta según tu código)
EXPOSE 8000

# Comando para ejecutar la app (ajusta según tu framework)
CMD ["python", "main.py"]
```

---

## 3. Ejemplo de Dockerfile para FastAPI (con Uvicorn)

```dockerfile
FROM python:3.10-slim
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["uvicorn", "whisper_api:app", "--host", "0.0.0.0", "--port", "8001"]
```

---

## 4. ¿Qué es docker-compose.yml?
Un archivo **docker-compose.yml** permite definir y ejecutar múltiples contenedores Docker como un solo servicio (por ejemplo, app + base de datos).

---

## 5. Ejemplo básico de docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8001:8001"
    volumes:
      - .:/app
    environment:
      - PYTHONUNBUFFERED=1
```

---

## 6. Ejemplo con base de datos (Postgres)

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
  db:
    image: postgres:14
    environment:
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
```

---

## 7. Comandos útiles

- **Construir imagen:**
  ```bash
  docker build -t miapp .
  ```
- **Ejecutar contenedor:**
  ```bash
  docker run -p 8000:8000 miapp
  ```
- **Levantar todo con Compose:**
  ```bash
  docker-compose up --build
  ```
- **Detener servicios:**
  ```bash
  docker-compose down
  ```

---

