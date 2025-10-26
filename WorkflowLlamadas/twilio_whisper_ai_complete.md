# Integración Completa: Whisper-Streaming + Twilio Media Streams + Agente de IA

Esta guía describe cómo integrar Whisper-Streaming con Twilio para crear un sistema de transcripción y respuesta automática de voz (STT → LLM → TTS).



## 1️ Requisitos

- Python 3.11
- Twilio con número de voz
- Ngrok o túnel HTTPS
- GPU opcional para acelerar Whisper

---

## 2️ Instalación del entorno

```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install flask flask-sockets gevent gevent-websocket twilio numpy soxr g711 faster-whisper
```

---

## 3️ Configurar Whisper-Streaming

```bash
git clone https://github.com/ufal/whisper_streaming
cd whisper_streaming
python whisper_online_server.py --backend faster-whisper --model small --vac --host 127.0.0.1 --port 43001
```

---

## 4️ Servidor WebSocket (Flask)

Archivo: `app.py`

```python
import os, json, base64, socket, numpy as np, soxr
from flask import Flask, Response
from flask_sockets import Sockets
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
from g711 import decode_ulaw
from twilio.twiml.voice_response import VoiceResponse

WHISPER_HOST, WHISPER_PORT = "127.0.0.1", 43001
PORT = 5000

app = Flask(__name__)
sockets = Sockets(app)

def mulaw8k_to_pcm16k(payload_b64):
    data = base64.b64decode(payload_b64)
    f32 = decode_ulaw(data)
    f32_16k = soxr.resample(f32, 8000, 16000)
    return np.clip(f32_16k * 32767, -32768, 32767).astype("<i2").tobytes()

@sockets.route("/media")
def media(ws):
    tcp = socket.create_connection((WHISPER_HOST, WHISPER_PORT))
    try:
        while not ws.closed:
            msg = ws.receive()
            if not msg: continue
            data = json.loads(msg)
            if data.get("event") == "media":
                pcm16 = mulaw8k_to_pcm16k(data["media"]["payload"])
                tcp.sendall(pcm16)
    finally:
        tcp.close()

@app.route("/twiml/inbound", methods=["GET", "POST"])
def inbound():
    vr = VoiceResponse()
    with vr.start() as s:
        s.stream(url=os.getenv("STREAM_WSS_URL"), track="inbound_audio")
    vr.pause(length=600)
    return Response(str(vr), mimetype="text/xml")

@app.route("/twiml/outbound", methods=["GET", "POST"])
def outbound():
    vr = VoiceResponse()
    with vr.connect() as c:
        c.stream(url=os.getenv("STREAM_WSS_URL"))
    return Response(str(vr), mimetype="text/xml")

if __name__ == "__main__":
    server = pywsgi.WSGIServer(("", PORT), app, handler_class=WebSocketHandler)
    print(f"Listening on :{PORT}")
    server.serve_forever()
```

---

## 5️ Exponer con Ngrok

```bash
ngrok http 5000
export STREAM_WSS_URL="wss://<subdominio>.ngrok-free.app/media"
```

---

## 6️ Llamadas entrantes (Inbound)

Configura el número Twilio → **A Call Comes In** = `https://TU_DOMINIO/twiml/inbound`.

```xml
<Response>
  <Start>
    <Stream url="wss://<subdominio>.ngrok-free.app/media" name="twilio-media" track="inbound_audio"/>
  </Start>
  <Pause length="600"/>
</Response>
```

---

## 7️ Llamadas salientes (Outbound)

Archivo: `make_call.py`

```python
import os
from twilio.rest import Client

client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
call = client.calls.create(
    from_=os.getenv("TWILIO_FROM"),
    to=os.getenv("TO_NUMBER"),
    url=os.getenv("TWIML_URL")
)
print("Llamada iniciada:", call.sid)
```

---

## 8️ Agente de IA (STT → LLM → TTS → Twilio)

```python
import json, numpy as np, soxr, base64
from g711 import encode_ulaw

def tts_placeholder(text="Hola, soy tu asistente."):
    sr = 16000
    t = np.linspace(0, 0.3, int(sr*0.3))
    beep = (0.2*np.sin(2*np.pi*440*t)).astype(np.float32)
    return (beep*32767).astype(np.int16)

def pcm16_to_ulaw8k_b64(pcm16):
    f32 = pcm16.astype(np.float32)/32768.0
    f32_8k = soxr.resample(f32, 16000, 8000)
    ulaw = encode_ulaw(f32_8k.astype(np.float32))
    return base64.b64encode(ulaw).decode()

def send_tts(ws, stream_sid, text):
    pcm = tts_placeholder(text)
    payload = pcm16_to_ulaw8k_b64(pcm)
    ws.send(json.dumps({"event":"media","streamSid":stream_sid,"media":{"payload":payload}}))
```

Modelos a escojer: **Coqui TTS**, **Piper**,  **Edge-TTS** 

---

## 9️ Ejecución
```bash
python whisper_online_server.py --backend faster-whisper --model small --vac
python app.py
ngrok http 5000
```


---
