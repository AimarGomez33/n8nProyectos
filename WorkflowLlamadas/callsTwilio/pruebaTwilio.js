require('dotenv').config();
const express = require('express');
const { twiml: { VoiceResponse } } = require('twilio');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const app = express();
app.use(express.urlencoded({ extended: false }));

// === Endpoint que Twilio usará cuando la persona conteste ===
app.post('/voice', (req, res) => {
  const vr = new VoiceResponse();

  // Mensaje que Twilio dirá al contestar
  vr.say({ voice: 'woman', language: 'es-MX' }, 'Hola, esta es una llamada de prueba desde tu aplicación Twilio.');
  vr.pause({ length: 1 });
  vr.say({ voice: 'woman', language: 'es-MX' }, 'Gracias por contestar. Adiós.');
  vr.hangup();

  res.type('text/xml').send(vr.toString());
});

// === Ruta para iniciar una llamada saliente ===
app.get('/call', async (req, res) => {
  try {
    const call = await client.calls.create({
      url: 'https://8e5c8d562f36.ngrok-free.app/voice',  // Twilio pedirá aquí el TwiML
      to: '+527711270119',                        // Número destino
      from: process.env.TWILIO_PHONE              // Tu número Twilio
    });

    res.send(`Llamada iniciada: ${call.sid}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al iniciar la llamada');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
