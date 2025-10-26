# TTS Voice Cloning - Archivos de Deployment

## Archivos Docker Disponibles

### Desarrollo/Testing
- **`docker-compose.yml`** - Configuración principal para desarrollo y testing
- **`Dockerfile`** - Imagen optimizada para CPU

### Producción
- **`docker-compose.prod.yml`** - Configuración de producción con Nginx, límites de recursos y healthchecks avanzados

## Scripts de Deployment

### Desarrollo
```cmd
redeploy.bat       # Reconstruir y desplegar en modo desarrollo
test_deployment.bat # Probar que todo funciona correctamente
```

### Producción
```cmd
deploy_prod.bat    # Desplegar en modo producción con Nginx
```

## Uso Rápido

**Para desarrollo:**
```cmd
docker-compose up -d
```

**Para producción:**
```cmd
docker-compose -f docker-compose.prod.yml up -d
```

## Endpoints

- **API:** http://localhost:8000
- **Gradio:** http://localhost:7860  
- **Docs:** http://localhost:8000/docs
- **Nginx (prod):** http://localhost:80

## Archivos Eliminados (ya no necesarios)

- ~~`docker-compose.cpu.yml`~~ - Redundante con docker-compose.yml
- ~~`docker-compose.amd.yml`~~ - Solo necesario si usas GPU AMD/ROCm
- ~~`Dockerfile.cpu`~~ - Redundante con Dockerfile principal
- ~~`Dockerfile.amd`~~ - Solo necesario si usas GPU AMD/ROCm
