# WhatsApp Webhook Trigger

Una alternativa al nodo de WhatsApp de n8n que usa whatsapp-web.js para detectar mensajes entrantes y enviarlos por webhook y API REST.

## 🚀 Características

- ✅ Conecta con WhatsApp Web usando whatsapp-web.js
- 📱 Detecta mensajes entrantes automáticamente
- 🔗 Envía mensajes por webhook en tiempo real
- 📡 Soporte para múltiples endpoints de API REST
- 📷 Manejo de archivos multimedia (fotos, videos, documentos)
- 👥 Soporte para mensajes de grupo e individuales
- 🔄 Sistema de reintentos automático
- 📊 Interfaz web para monitoreo
- 🔐 Autenticación persistente

## 📦 Instalación

1. Clona o descarga este proyecto
2. Instala las dependencias:

```bash
npm install
```

3. Copia el archivo `.env` y configura las variables:

```bash
# Variables del servidor
PORT=3000
HOST=localhost

# URL del webhook donde enviar los mensajes recibidos
WEBHOOK_URL=http://localhost:3001/webhook/whatsapp

# Configuración de la API REST (opcional)
API_KEY=tu_api_key_aqui

# Endpoints adicionales (opcional)
API_ENDPOINT=https://tu-api.com/webhooks/whatsapp
API_ENDPOINT_1=https://backup-api.com/whatsapp
API_KEY_1=tu_segunda_api_key

# Configuración adicional
DEBUG=true
```

## 🎯 Uso

### Servidor principal (WhatsApp + Webhook)

```bash
npm start
```

### Servidor de pruebas (para recibir webhooks)

En otra terminal:

```bash
node src/test-webhook-server.js
```

## 📱 Primera configuración

1. Ejecuta `npm start`
2. Escanea el código QR que aparece en la terminal con WhatsApp
3. Una vez conectado, los mensajes entrantes se enviarán automáticamente

## 🔗 Endpoints disponibles

### Servidor principal (puerto 3000)

- `GET /status` - Estado de la conexión
- `GET /qr` - Obtener código QR si no está autenticado
- `POST /send-message` - Enviar mensaje
- `POST /disconnect` - Desconectar WhatsApp

### Servidor de pruebas (puerto 3001)

- `GET /` - Interfaz web de monitoreo
- `POST /webhook/whatsapp` - Endpoint para recibir webhooks
- `GET /messages` - Ver mensajes recibidos
- `GET /status` - Estado del servidor

## 📤 Enviar mensajes

```bash
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5215551234567",
    "message": "Hola, este es un mensaje de prueba"
  }'
```

## 📋 Formato de webhook

Cuando se recibe un mensaje, se envía el siguiente payload:

```json
{
  "event": "message_received",
  "timestamp": "2025-01-12T10:30:00.000Z",
  "data": {
    "message": {
      "id": "mensaje_id_unico",
      "from": "5215551234567@c.us",
      "to": "5215557654321@c.us",
      "body": "Texto del mensaje",
      "type": "chat",
      "timestamp": 1673518200,
      "isForwarded": false,
      "isGroup": false,
      "groupName": null,
      "hasMedia": false,
      "media": null,
      "location": null,
      "quotedMessage": null,
      "links": [],
      "mentions": []
    },
    "contact": {
      "id": "5215551234567@c.us",
      "name": "Juan Pérez",
      "number": "5215551234567",
      "isMyContact": true
    },
    "metadata": {
      "source": "whatsapp-web-js",
      "version": "1.0.0",
      "processed_at": "2025-01-12T10:30:00.123Z"
    }
  }
}
```

## 🔧 Configuración avanzada

### Múltiples webhooks

Puedes configurar múltiples endpoints añadiendo variables de entorno:

```env
API_ENDPOINT_1=https://api1.ejemplo.com/webhook
API_KEY_1=key1

API_ENDPOINT_2=https://api2.ejemplo.com/webhook
API_KEY_2=key2
```

### Autenticación

El sistema usa `LocalAuth` para mantener la sesión persistente. Los datos se guardan en `.wwebjs_auth/`.

## 📸 Multimedia

Los archivos multimedia se procesan automáticamente:

- ✅ Fotos y imágenes
- ✅ Videos
- ✅ Documentos
- ✅ Audio/notas de voz
- ✅ Stickers

Los archivos se incluyen en Base64 en el webhook (para archivos pequeños) o como metadatos (para archivos grandes).

## 🔄 Integración con n8n

1. Usa el nodo HTTP Request para enviar a tu API
2. Configura un webhook trigger en n8n
3. Apunta `WEBHOOK_URL` a tu webhook de n8n

Ejemplo de flujo n8n:
```
Webhook Trigger → Procesar mensaje → Responder/Guardar
```

## 🚨 Solución de problemas

### WhatsApp no se conecta
- Verifica que no tengas WhatsApp Web abierto en otro lugar
- Elimina la carpeta `.wwebjs_auth` para reiniciar la sesión
- Asegúrate de tener una conexión estable a internet

### Los webhooks no llegan
- Verifica la URL en `WEBHOOK_URL`
- Revisa los logs para errores de red
- Usa el servidor de pruebas para verificar el formato

### Error de permisos
- En Linux/Mac, da permisos de ejecución: `chmod +x start.sh`
- En Windows, ejecuta como administrador si es necesario

## 📁 Estructura del proyecto

```
whatsapp-webhook-trigger/
├── src/
│   ├── index.js                 # Servidor principal
│   ├── test-webhook-server.js   # Servidor de pruebas
│   └── services/
│       ├── WhatsAppService.js   # Manejo de WhatsApp
│       ├── WebhookService.js    # Envío de webhooks
│       └── ApiService.js        # APIs REST
├── package.json
├── .env
└── README.md
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - ve el archivo LICENSE para más detalles.

## 🆘 Soporte

Si tienes problemas:

1. Revisa la sección de solución de problemas
2. Verifica los logs en la consola
3. Usa el endpoint `/status` para verificar el estado
4. Abre un issue en GitHub

---

**Nota**: Este proyecto no está afiliado oficialmente con WhatsApp. Usa la API no oficial de WhatsApp Web bajo tu propio riesgo.
