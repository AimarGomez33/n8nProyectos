# Agente de IA que contesta llamadas telefónicas usando n8n + Ultravox



## 1. Arquitectura 


1. **Telefonía / Voz en vivo (Ultravox / Twilio-like)**  
   - Recibe la llamada entrante.
   - Envía audio en tiempo real (stream) a tu backend.
   - Reproduce audio de vuelta al usuario.

2. **Transcripción (STT - Speech To Text)**  
   - Convierte audio del usuario → texto.
   - Ej: Whisper.

3. **Razonamiento (LLM / Agente IA)**  
   - Lee lo que dijo el usuario.
   - Decide qué contestar.
   - Puede tomar acciones (ej. agendar cita en Google Calendar, consultar base de datos, etc.).
   - Vive dentro de tu flujo de n8n.

4. **Síntesis de Voz (TTS - Text To Speech)**  
   - Convierte la respuesta del agente → audio.
   - Ese audio se manda de regreso a la llamada para que la persona lo escuche.

Visualmente:

Persona  → Ultravox → (audio) → n8n/Whisper → (texto)  
→ LLM agente → (texto respuesta) → TTS → (audio) → Ultravox → Persona 

---

## 2. Requisitos previos

### 2.1 Infraestructura mínima
- Un servidor accesible públicamente por HTTPS.
- n8n corriendo con URL pública segura (HTTPS).
- Una cuenta en Ultravox.
- (Opcional) Un dominio tipo `bot.midominio.com`.

### 2.2 Software / Servicios
- **n8n** — Motor de automatización.
- **STT (Whisper)** — Convierte audio en texto.
- **LLM** — Genera la respuesta.
- **TTS** — Convierte texto a voz.

---

## 3. Flujo lógico completo

1. Llamada entra.
2. Ultravox contesta y saluda.
3. Ultravox transmite audio del usuario.
4. Se detecta silencio → envía chunk a STT.
5. n8n recibe texto.
6. n8n consulta al LLM con el historial.
7. El LLM responde texto.
8. n8n manda texto a TTS.
9. Ultravox reproduce audio.
10. Repite hasta fin de llamada.

---

## 4. Configuración de Ultravox

- Asigna un **webhook entrante** (por ejemplo: `https://tu-servidor.com/callWebhook`).
- Configura streaming de audio en formato μ-law 8k.
- Define saludo inicial (audio o texto a TTS).

---

## 5. Creación del flujo en n8n

### Nodos necesarios
- **Webhook** (trigger)
- **Function** (routing de eventos)
- **HTTP STT**
- **HTTP LLM**
- **HTTP TTS**
- **HTTP Ultravox respuesta**
- (Opcional) **Google Calendar**

### Flujo visual
Webhook → Switch (evento) → STT → LLM → TTS → Ultravox → Loop

---

## 6. Procesar voz del usuario → texto (STT)

Ejemplo de llamada al STT:
```json
{
  "audio_base64": "BASE64_DEL_CHUNK",
  "format": "mulaw_8k",
  "language": "es"
}
```

Respuesta:
```json
{ "text": "Quiero hacer una cita para mañana a las 4." }
```

---

## 7. Decidir qué contestar (LLM)

Prompt ejemplo:
```text
Eres un asistente telefónico para la clínica "Salud Familiar".
Tu tarea es ayudar a quien llama. Si pide una cita, pide fecha y hora.
Si pregunta horarios, respóndelos.
No inventes información.
```

---

## 8. Convertir respuesta a voz (TTS)

Petición:
```json
{
  "text": "Perfecto, ¿me confirmas tu nombre completo?",
  "voice": "recepcionista_mx",
  "format": "mulaw_8k_base64"
}
```

Respuesta:
```json
{ "audio_base64": "<BASE64_AUDIO>" }
```

---

## 9. Responder al usuario (Ultravox API)

```json
{
  "callId": "abc123",
  "audio_base64": "<BASE64_AUDIO>",
  "codec": "mulaw_8k"
}
```

---

## 10. Manejo del cierre de llamada

Cuando recibas `CALL_ENDED`:
- Guarda el historial.
- Limpia la sesión.

---

## 11. Buenas prácticas

- Usa prompts claros.
- Detecta silencios para enviar chunks.
- Evita respuestas largas.
- Implementa logs.
- No inventes información.

---

## 12. Extensiones

### Agendar citas usando la api de Google Calendar
Permite al bot crear eventos automáticamente según fecha y hora que el usuario mencione.

### FAQs automáticas
Incluye en el prompt del LLM una lista de preguntas frecuentes.

### Transferencia a humano
Si el LLM detecta intención de transferencia, llama a un número real.

---

## 13. Resumen final

Llamada → n8n recibe → STT → LLM → TTS → Ultravox → Usuario  
Loop hasta que el usuario cuelgue.

---

