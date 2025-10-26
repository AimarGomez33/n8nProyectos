#  Guía de Endpoints - WhatsApp Webhook Trigger

##  Puerto 3000 - Servidor Principal (API de WhatsApp)

###  http://localhost:3000/
**¡NUEVA PÁGINA PRINCIPAL!**
-  Panel de control completo
- Estado de conexión de WhatsApp
-  Lista de todos los endpoints
-  Configuración actual
-  Enlaces para conectar WhatsApp
- Se actualiza automáticamente cada 30 segundos

###  http://localhost:3000/status
```json
{
  "status": "running",
  "whatsapp_connected": true,
  "timestamp": "2025-07-12T..."
}
```

### http://localhost:3000/qr
- Obtiene el código QR para conectar WhatsApp
- Solo funciona si WhatsApp no está conectado

### http://localhost:3000/send-message
```bash
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5215551234567",
    "message": "Hola desde la API!"
  }'
```

---

## Puerto 3001 - Servidor de Monitoreo (Webhooks)

###  http://localhost:3001/
-  Monitor web para ver mensajes recibidos
-  Lista de todos los mensajes en tiempo real
-  Botón para limpiar mensajes
-  Se actualiza automáticamente cada 5 segundos

###  http://localhost:3001/webhook/whatsapp
- **Endpoint para recibir webhooks**
- Aquí llegan los mensajes de WhatsApp
- Formato JSON estructurado
- Para integrar con n8n, usa esta URL

###  http://localhost:3001/messages
```json
{
  "total": 5,
  "limit": 10,
  "messages": [...]
}
```

---



###  **Para enviar mensajes** → `http://localhost:3000`
```bash
# Enviar mensaje
POST http://localhost:3000/send-message

# Ver estado
GET http://localhost:3000/status
```

###  **Para recibir mensajes** → `http://localhost:3001`
```bash
# Ver mensajes recibidos
GET http://localhost:3001/messages

# Webhook endpoint (para n8n)
POST http://localhost:3001/webhook/whatsapp
```

###  **Para monitorear** → Ambos tienen páginas web
- `http://localhost:3000/` → Control y estado de WhatsApp
- `http://localhost:3001/` → Monitor de mensajes recibidos

---
