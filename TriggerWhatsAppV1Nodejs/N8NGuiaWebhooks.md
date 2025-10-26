# n8n + WhatsApp Webhook Trigger

-  WhatsApp Webhook Trigger funcionando
-  Webhook URL configurada: `https://jairgomez44.app.n8n.cloud/webhook-test/...`
-  Listo para recibir mensajes en n8n

---

##  Paso 1: Configurar el Webhook Trigger en n8n

### 1.1 Crear nuevo workflow
1. Ve a tu n8n: `https://jairgomez44.app.n8n.cloud`
2. Crea un nuevo workflow
3. Agrega el nodo **"Webhook"**

### 1.2 Configurar el nodo Webhook
```
HTTP Method: POST
Path: webhook-test/a32dc71c-6d7a-4e45-b34c-0ddb30be916e
Authentication: None
Response Code: 200
Response Data: JSON
```

### 1.3 Estructura del mensaje que recibirás:
```json
{
  "event": "message_received",
  "timestamp": "2025-07-12T...",
  "data": {
    "message": {
      "id": "mensaje_id_unico",
      "from": "5215551234567@c.us",
      "to": "tu_numero@c.us", 
      "body": "Hola, este es el mensaje",
      "type": "chat",
      "timestamp": 1673518200,
      "isGroup": false,
      "groupName": null,
      "hasMedia": false,
      "location": null,
      "links": ["http://..."],
      "mentions": []
    },
    "contact": {
      "id": "5215551234567@c.us",
      "name": "Juan Pérez",
      "number": "5215551234567",
      "isMyContact": true
    }
  }
}
```

---
