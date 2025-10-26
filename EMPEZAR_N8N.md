# 🎯 EMPEZAR AHORA: Tu primer flujo en n8n

## ✅ Prerrequisitos completados:
- ✅ WhatsApp Webhook Trigger funcionando
- ✅ Webhook URL configurada: `https://jairgomez44.app.n8n.cloud/webhook-test/...`
- ✅ n8n disponible en: `https://jairgomez44.app.n8n.cloud`

---

## 🚀 PASO 1: Crear tu primer workflow (5 minutos)

### 1.1 Acceder a n8n
1. Ve a: `https://jairgomez44.app.n8n.cloud`
2. Inicia sesión
3. Clic en **"+ New Workflow"**

### 1.2 Agregar nodo Webhook
1. Clic en **"+"** para agregar nodo
2. Buscar: **"Webhook"**
3. Agregar el nodo

### 1.3 Configurar el Webhook
```
HTTP Method: POST
Path: webhook-test/a32dc71c-6d7a-4e45-b34c-0ddb30be916e
Authentication: None
Response Mode: Using 'Respond to Webhook' Node
```

### 1.4 Agregar nodo Function
1. Conectar el webhook a un **Function Node**
2. Copiar este código en el Function Node:

```javascript
// Tu primer código para procesar mensajes de WhatsApp
const messageData = $json.data;
const message = messageData.message;
const contact = messageData.contact;

// Log para ver qué llega
console.log('📱 Mensaje recibido de:', contact.name);
console.log('💬 Contenido:', message.body);

// Preparar respuesta automática
return {
  json: {
    number: contact.number,
    message: `🤖 ¡Hola ${contact.name}!
    
Recibí tu mensaje: "${message.body}"

Este es mi primer bot de WhatsApp funcionando con n8n.

¡Estoy emocionado! 🎉`
  }
};
```

### 1.5 Agregar HTTP Request para responder
1. Agregar nodo **HTTP Request**
2. Configurar:
```
Method: POST
URL: http://localhost:3000/send-message
Headers: Content-Type: application/json
Body: JSON → {{ $json }}
```

### 1.6 Agregar Respond to Webhook
1. Agregar nodo **Respond to Webhook**
2. Configurar:
```
Respond With: JSON
Response Body: {"status": "success", "message": "¡Primer bot funcionando!"}
```

### 1.7 Conectar los nodos
```
Webhook → Function → HTTP Request → Respond to Webhook
```

### 1.8 ¡Activar y probar!
1. Clic en **"Save"** para guardar
2. Clic en **"Active"** para activar
3. Envíate un mensaje de WhatsApp
4. ¡Deberías recibir la respuesta automática!

---

## 🧪 PASO 2: Probar que funciona

### Opción 1: Mensaje real
1. Envía un WhatsApp a tu número desde otro teléfono
2. Espera la respuesta automática
3. ¡Éxito! 🎉

### Opción 2: Prueba desde n8n
1. En n8n, clic en **"Test Webhook"**
2. Ejecuta el workflow manualmente
3. Verifica que no hay errores

### Opción 3: Ver en el monitor
1. Ve a: `http://localhost:3001`
2. Verifica que llegan los mensajes
3. Revisa los logs en la consola

---

## 🎯 PASO 3: Workflows listos para importar

He creado 3 workflows completos que puedes importar:

### 📁 `basic-auto-response.json`
- ✅ Respuesta automática simple
- ✅ Logs de mensajes
- ✅ Perfecto para empezar

### 📁 `intelligent-chatbot.json`
- 🤖 Chatbot inteligente con múltiples respuestas
- 🔄 Detecta saludos, precios, horarios
- 🎯 Respuestas contextuales

### 📁 `google-sheets-integration.json`
- 📊 Guarda todos los mensajes en Google Sheets
- 📈 Estadísticas automáticas
- 💾 Base de datos completa

### 🔄 Cómo importar:
1. En n8n: **"+ New Workflow"**
2. Clic en **"⋯" (tres puntos)**
3. **"Import from file"**
4. Seleccionar el archivo JSON
5. **¡Listo para usar!**

---

## 🎨 PASO 4: Personaliza tu bot

### 🔧 Cambiar mensajes de respuesta
En el Function Node, modifica:
```javascript
message: `Tu mensaje personalizado aquí
Puedes usar emojis 🚀
Y saltos de línea`
```

### 🕐 Agregar horarios de atención
```javascript
const hora = new Date().getHours();
if (hora < 9 || hora > 18) {
  return {
    json: {
      number: contact.number,
      message: "🕐 Fuera de horario. Te responderé mañana."
    }
  };
}
```

### 🎯 Respuestas específicas por palabra clave
```javascript
const mensaje = message.body.toLowerCase();

if (mensaje.includes("precio")) {
  return { json: { number: contact.number, message: "💰 Lista de precios..." } };
}

if (mensaje.includes("horario")) {
  return { json: { number: contact.number, message: "🕐 Horarios de atención..." } };
}
```

---

## 📊 PASO 5: Monitoreo y estadísticas

### Ver ejecuciones en n8n:
1. Ve a **"Executions"** en el sidebar
2. Revisa cada ejecución
3. Ve errores y datos procesados

### Monitor en tiempo real:
- `http://localhost:3001` - Ver mensajes entrantes
- `http://localhost:3000/status` - Estado del sistema

### Logs en consola:
```bash
# En la terminal donde corre el servidor
📱 Mensaje recibido: {...}
📤 Enviando mensaje a webhook...
✅ Webhook enviado exitosamente
```

---

## 🆘 Solución de problemas

### ❌ "Webhook no recibe datos"
✅ Verifica que el Path sea exacto: `webhook-test/a32dc71c-6d7a-4e45-b34c-0ddb30be916e`
✅ Workflow debe estar **Active**
✅ Revisa logs en `http://localhost:3001`

### ❌ "No se envía respuesta"
✅ Verifica URL: `http://localhost:3000/send-message`
✅ WhatsApp debe estar conectado (QR escaneado)
✅ Formato JSON correcto: `{"number": "...", "message": "..."}`

### ❌ "Error en Function Node"
✅ Revisa sintaxis JavaScript
✅ Usa `console.log()` para debug
✅ Verifica que `$json.data` existe

---

## 🎯 Próximos pasos sugeridos:

1. **Empezar:** Crea el workflow básico ✅
2. **Probar:** Envía mensajes y verifica respuestas ✅
3. **Personalizar:** Cambia mensajes según tu negocio
4. **Expandir:** Agrega más funcionalidades
5. **Integrar:** Conecta con Google Sheets, Slack, etc.

### 🔥 Ideas para expandir:
- 📅 Sistema de citas
- 🛒 Catálogo de productos
- 📊 Encuestas automáticas
- 🎫 Tickets de soporte
- 📧 Notificaciones por email

---

## 🎉 ¡Estás listo!

Con tu configuración actual:
- ✅ WhatsApp conectado y funcionando
- ✅ Webhook configurado en n8n
- ✅ Workflows de ejemplo listos
- ✅ Monitor en tiempo real

**¡Solo falta activar tu primer workflow y empezar a automatizar WhatsApp!** 🚀

¿Qué tipo de bot quieres crear primero? 🤖
