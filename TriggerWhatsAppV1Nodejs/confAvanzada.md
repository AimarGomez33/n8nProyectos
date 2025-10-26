# 🔧 Configuración Avanzada - WhatsApp Webhook Trigger

## 📁 Archivo .env completo

```env
# ===== CONFIGURACIÓN BÁSICA =====
PORT=3000
HOST=localhost
DEBUG=true

# ===== WEBHOOK PRINCIPAL =====
WEBHOOK_URL=http://localhost:3001/webhook/whatsapp

# ===== AUTENTICACIÓN =====
API_KEY=tu_api_key_super_secreta_aqui

# ===== ENDPOINTS DE API MÚLTIPLES =====
# Endpoint principal
API_ENDPOINT=https://tu-api.com/webhooks/whatsapp
API_KEY_1=tu_primera_api_key

# Endpoint de respaldo
API_ENDPOINT_2=https://backup-api.com/whatsapp
API_KEY_2=tu_segunda_api_key

# Endpoint para análisis
API_ENDPOINT_3=https://analytics.com/whatsapp-data
API_KEY_3=analytics_api_key

# ===== CONFIGURACIÓN AVANZADA =====
# Timeout para requests (milisegundos)
REQUEST_TIMEOUT=10000

# Número máximo de reintentos
MAX_RETRIES=3

# Activar/desactivar funcionalidades
ENABLE_MEDIA_DOWNLOAD=true
ENABLE_GROUP_MESSAGES=true
ENABLE_STATUS_WEBHOOKS=true

# Filtros de mensajes
IGNORE_FORWARDED=false
IGNORE_GROUP_MESSAGES=false
MIN_MESSAGE_LENGTH=1

# Configuración de Puppeteer (para WhatsApp Web)
PUPPETEER_HEADLESS=true
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox
```

## 🎯 Configuraciones específicas por uso

### Para n8n
```env
WEBHOOK_URL=https://tu-n8n-instance.com/webhook/whatsapp-trigger
API_KEY=tu_webhook_secret
```

### Para Make (Integromat)
```env
WEBHOOK_URL=https://hook.make.com/tu-webhook-id
```

### Para Zapier
```env
WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/tu-webhook-id
```

### Para múltiples servicios
```env
WEBHOOK_URL=http://localhost:3001/webhook/whatsapp
API_ENDPOINT_1=https://n8n.com/webhook/whatsapp
API_ENDPOINT_2=https://hooks.zapier.com/hooks/catch/123
API_ENDPOINT_3=https://hook.make.com/webhook
```

## 🔒 Seguridad y autenticación

### Webhook con autenticación
```env
WEBHOOK_URL=https://secure-api.com/webhook
API_KEY=Bearer tu_token_jwt_aqui
```

### Headers personalizados
Puedes modificar `src/services/WebhookService.js` para añadir headers:

```javascript
headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.API_KEY}`,
    'X-API-Source': 'whatsapp-trigger',
    'X-Signature': generateSignature(payload)
}
```

## 📱 Configuración de WhatsApp

### Sesión personalizada
Modifica `src/services/WhatsAppService.js`:

```javascript
authStrategy: new LocalAuth({
    name: 'mi-sesion-personalizada',
    dataPath: './custom-session-data'
})
```

### Configuración de Puppeteer
```javascript
puppeteer: {
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    args: process.env.PUPPETEER_ARGS?.split(',') || [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ],
    executablePath: process.env.CHROME_PATH // Para usar Chrome específico
}
```

## 🔄 Filtros y procesamiento

### Filtrar mensajes por tipo
En `src/services/WhatsAppService.js`, modifica `processMessage`:

```javascript
// Solo procesar mensajes de texto
if (message.type !== 'chat') return;

// Ignorar mensajes reenviados
if (message.isForwarded && process.env.IGNORE_FORWARDED === 'true') return;

// Filtrar por longitud mínima
if (message.body.length < parseInt(process.env.MIN_MESSAGE_LENGTH || '1')) return;
```

### Filtrar por contactos específicos
```javascript
// Solo procesar mensajes de contactos conocidos
if (!contact.isMyContact && process.env.ONLY_CONTACTS === 'true') return;

// Lista blanca de números
const allowedNumbers = process.env.ALLOWED_NUMBERS?.split(',') || [];
if (allowedNumbers.length > 0 && !allowedNumbers.includes(contact.number)) return;
```

## 📊 Monitoreo y logs

### Configuración de logs
```env
# Nivel de logs: error, warn, info, debug
LOG_LEVEL=info

# Archivo de logs
LOG_FILE=./logs/whatsapp-trigger.log

# Logs en formato JSON
LOG_JSON=true
```

### Métricas y estadísticas
```env
# Activar métricas
ENABLE_METRICS=true

# Endpoint para métricas
METRICS_ENDPOINT=http://prometheus:9090/metrics

# Intervalo de estadísticas (segundos)
STATS_INTERVAL=60
```

## 🔄 Configuración de reintentos

### Configuración avanzada de reintentos
```javascript
// En WebhookService.js
const retryConfig = {
    retries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '2000'),
    retryCondition: (error) => {
        // Solo reintentar en errores de red
        return error.code === 'ECONNREFUSED' || 
               error.response?.status >= 500;
    }
};
```

## 📁 Estructura de archivos personalizada

```
proyecto/
├── config/
│   ├── production.env
│   ├── development.env
│   └── staging.env
├── logs/
│   └── app.log
├── sessions/
│   └── whatsapp-session/
├── uploads/
│   └── media/
└── scripts/
    ├── deploy.sh
    └── backup.sh
```

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  whatsapp-trigger:
    build: .
    ports:
      - "3000:3000"
    environment:
      - WEBHOOK_URL=http://webhook-server:3001/webhook/whatsapp
    volumes:
      - ./sessions:/app/.wwebjs_auth
      - ./logs:/app/logs
```

### PM2
```json
{
  "apps": [{
    "name": "whatsapp-trigger",
    "script": "src/index.js",
    "instances": 1,
    "env": {
      "NODE_ENV": "production",
      "PORT": 3000
    },
    "log_file": "./logs/app.log",
    "error_file": "./logs/error.log",
    "out_file": "./logs/out.log"
  }]
}
```

---

**💡 Tip**: Siempre mantén backups de tu configuración y archivos de sesión!
