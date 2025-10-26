# 🚀 Guía de Despliegue Simple - Desde Cero

## ✅ **Configuración Simplificada Lista**

He simplificado toda la configuración para que sea más fácil de desplegar:

### **Cambios realizados:**
- ✅ Bicep simplificado (solo lo esencial)
- ✅ Eliminado Container Registry (usa imagen pública temporalmente)
- ✅ Eliminado Key Vault (no necesario para inicio)
- ✅ Eliminado Managed Identity complejo
- ✅ Solo Container App + Log Analytics

## 📋 **Pasos para Desplegar (Terminal de Windows)**

### **1. Verificar herramientas**
```cmd
# Abrir terminal de Windows (Win + R → cmd)
cd "C:\Users\jair_\OneDrive\Desktop\whisper_ai"

# Verificar instalaciones
az --version
azd version
docker --version
```

### **2. Si azd no está instalado:**
```cmd
winget install Microsoft.AzureDeveloperCLI
# Cerrar y abrir nueva terminal después de instalar
```

### **3. Autenticación**
```cmd
# Login a Azure
az login --use-device-code

# Verificar suscripciones
az account list --output table

# Login a azd
azd auth login
```

### **4. Limpiar configuración anterior (si existe)**
```cmd
# Si hay archivos .azure, eliminar la carpeta
rmdir /s .azure
```

### **5. Inicializar proyecto**
```cmd
azd init
```

**Respuestas sugeridas:**
- **Environment name**: `whisper-simple`
- **Subscription**: Selecciona tu suscripción
- **Location**: `East US`

### **6. Desplegar**
```cmd
azd up
```

## 🎯 **Lo que va a crear:**

1. **Resource Group**: `rg-whisper-simple`
2. **Log Analytics**: Para logs de la aplicación
3. **Container Apps Environment**: Entorno de contenedores
4. **Container App**: Tu aplicación Whisper

## ⚡ **Si hay errores:**

### **Error de suscripción:**
```cmd
# Verificar que tienes suscripción activa
az account show
```

### **Error de permisos:**
```cmd
# Verificar que tu cuenta tiene permisos de Contributor
az role assignment list --assignee tu-email@hotmail.com
```

### **Error de región:**
- Cambia la región a `West US 2` o `West Europe`

## 🔧 **Después del despliegue:**

1. **Obtener URL de la API:**
```cmd
azd show --output json
```

2. **Ver logs:**
```cmd
azd logs
```

3. **Probar la API:**
La URL será algo como: `https://whisper-simple-abc123-whisper.greenriver-abc123.eastus.azurecontainerapps.io`

## 🚨 **Si sigues teniendo problemas:**

Dime exactamente qué error te aparece y en qué paso, para ayudarte específicamente.

## 📞 **Alternativa: Azure Portal**

Si prefieres usar la interfaz gráfica:
1. Ve a https://portal.azure.com
2. Busca "Container Apps"
3. Crear nueva Container App manualmente

¿En qué paso específico tuviste el error anterior?
