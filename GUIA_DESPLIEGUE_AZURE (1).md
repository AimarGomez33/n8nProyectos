# Guía Detallada: Desplegar servicios externos para usar en n8n

servirá para desplegar cualquier aplicación dockerizada en Azure, paso a paso.

---

## 1. Prerrequisitos

- Cuenta de Azure con suscripción activa
- Azure CLI (`az`)
- Docker Desktop

Opcional (recomendado):
- Azure Developer CLI (`azd`)

---

## 2. Preparar el entorno

### 2.1. Instalar herramientas
```cmd
winget install Microsoft.AzureCLI
winget install Microsoft.AzureDeveloperCLI
```

### 2.2. Iniciar sesión en Azure
```cmd
az login --use-device-code
az account list --output table
azd auth login
```

---

## 3. Crear recursos en Azure

### 3.1. Crear grupo de recursos
```cmd
az group create --name <nombre-grupo> --location <region>
# Ejemplo:
az group create --name rg-miapp --location eastus
```

### 3.2. Crear Azure Container Registry (ACR)
```cmd
az acr create --resource-group <nombre-grupo> --name <nombre-acr> --sku Basic --location <region>
# Ejemplo:
az acr create --resource-group rg-miapp --name miappacr --sku Basic --location eastus
```

---

## 4. Construir y subir la imagen Docker

### 4.1. Login en el ACR
```cmd
az acr login --name <nombre-acr>
```

### 4.2. Construir la imagen
```cmd
docker build -t <nombre-acr>.azurecr.io/<nombre-imagen>:latest .
# Ejemplo:
docker build -t miappacr.azurecr.io/miapp:latest .
```

### 4.3. Subir la imagen al ACR
```cmd
docker push <nombre-acr>.azurecr.io/<nombre-imagen>:latest
# Ejemplo:
docker push miappacr.azurecr.io/miapp:latest
```

---

## 5. Crear el entorno de Azure Container Apps

### 5.1. Crear el entorno
```cmd
az containerapp env create --name <nombre-entorno> --resource-group <nombre-grupo> --location <region>
# Ejemplo:
az containerapp env create --name miapp-env --resource-group rg-miapp --location eastus
```

---

## 6. Crear la Container App

```cmd
az containerapp create ^
  --name <nombre-app> ^
  --resource-group <nombre-grupo> ^
  --environment <nombre-entorno> ^
  --image <nombre-acr>.azurecr.io/<nombre-imagen>:latest ^
  --target-port <puerto-app> ^
  --ingress external ^
  --registry-server <nombre-acr>.azurecr.io
# Ejemplo:
az containerapp create ^
  --name miapp ^
  --resource-group rg-miapp ^
  --environment miapp-env ^
  --image miappacr.azurecr.io/miapp:latest ^
  --target-port 8000 ^
  --ingress external ^
  --registry-server miappacr.azurecr.io
```

---

## 7. Obtener la URL pública

```cmd
az containerapp show --name <nombre-app> --resource-group <nombre-grupo> --query properties.configuration.ingress.fqdn -o tsv
```

---

## 8. Probar la API desplegada

```bash
curl -X GET "https://<tu-fqdn>/"
# O para endpoints POST, etc.
```

---

## 9. Comandos útiles adicionales

- **Ver logs:**
  ```cmd
  az containerapp logs show --name <nombre-app> --resource-group <nombre-grupo>
  ```
- **Actualizar imagen:**
  ```cmd
  docker build -t <acr>.azurecr.io/<imagen>:latest .
  docker push <acr>.azurecr.io/<imagen>:latest
  az containerapp update --name <app> --resource-group <grupo> --image <acr>.azurecr.io/<imagen>:latest
  ```
- **Eliminar recursos:**
  ```cmd
  az group delete --name <nombre-grupo> --yes --no-wait
  ```

---

## 10. Consejos y buenas prácticas

- Usa nombres únicos para recursos (ej: agrega fecha o iniciales)
- Usa variables de entorno para secretos (configura en Azure Portal o con `az containerapp update`)
- Mantén tu Dockerfile optimizado y pequeño
- Usa regiones cercanas a tus usuarios
- Elimina recursos que no uses para evitar costos

---

## 11. Problemas y soluciones frecuentes

### ❗ Error: ResourceGroupNotFound
- **Mensaje:** Resource group 'rg-xxxx' could not be found.
- **Solución:**
  ```cmd
  az group create --name rg-xxxx --location eastus
  ```

### ❗ Error: No credential was provided to access Azure Container Registry
- **Mensaje:** Failed to retrieve credentials for container registry ...
- **Solución:**
  1. Habilita el usuario admin en el ACR:
     ```cmd
     az acr update -n <nombre-acr> --admin-enabled true
     ```
  2. Obtén usuario y contraseña:
     ```cmd
     az acr credential show --name <nombre-acr>
     ```
  3. Usa los flags `--registry-username` y `--registry-password` en `az containerapp create`.

### ❗ Error de sintaxis con ^ en PowerShell
- **Mensaje:** Falta una expresión después del operador unario '--'.
- **Solución:**
  - Usa el comando en una sola línea, o
  - Usa el acento grave (`) para dividir líneas en PowerShell.

### ❗ Probar la API desplegada
- **Swagger UI:**
  - Ve a `https://<tu-fqdn>.azurecontainerapps.io/docs`
- **curl:**
  ```bash
  curl -X POST "https://<tu-fqdn>.azurecontainerapps.io/transcribe/" \
    -H "accept: application/json" \
    -H "Content-Type: multipart/form-data" \
    -F "file=@ruta/a/tu/audio.wav"
  ```

---

