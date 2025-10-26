import { Injectable } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service.js';

@Injectable()
export class FakeMessageService {
  constructor(private readonly wpp: WhatsAppService) {}

  // Simula un mensaje de texto entrante y lo procesa como si fuera recibido
  async simulateTextMessage(from: string, text: string) {
    // Crear objeto tipo Message simulado
    const msg: any = {
      from: this.normalizeToJid(from),
      to: 'server@c.us',
      timestamp: Math.floor(Date.now() / 1000),
      type: 'chat',
      id: { _serialized: 'fake_' + Date.now() },
      fromMe: false,
      body: text,
      ack: 1,
      deviceType: 'web',
      hasMedia: false,
    };
    const payload = await this.wpp['normalizeMessage'](msg);
    // Enviar el payload como JSON, no binario
    if (!this.wpp['webhook']) {
      return { ok: false, error: 'N8N_WEBHOOK_URL no configurado', payload };
    }
    try {
      await require('axios').post(this.wpp['webhook'], payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 12000
      });
      return { ok: true, simulated: true, payload };
    } catch (err: any) {
      return { ok: false, error: err.message, payload };
    }
  }

  // Simula un mensaje de audio entrante y lo procesa como si fuera recibido
  async simulateAudioMessage(from: string, audioBase64: string) {
    const msg: any = {
      from: this.normalizeToJid(from),
      to: 'server@c.us',
      timestamp: Math.floor(Date.now() / 1000),
      type: 'ptt',
      id: { _serialized: 'fake_' + Date.now() },
      fromMe: false,
      ack: 1,
      deviceType: 'web',
      hasMedia: true,
      downloadMedia: async () => ({
        mimetype: 'audio/ogg',
        filename: 'simulated-audio.ogg',
        data: audioBase64,
      }),
    };
    const payload = await this.wpp['normalizeMessage'](msg);
    await this.wpp['forwardToN8n'](payload);
    return { ok: true, simulated: true, payload };
  }

  // Simula un mensaje de imagen entrante y lo procesa como si fuera recibido
  async simulateImageMessage(from: string, imageBase64: string) {
    const msg: any = {
      from: this.normalizeToJid(from),
      to: 'server@c.us',
      timestamp: Math.floor(Date.now() / 1000),
      type: 'image',
      id: { _serialized: 'fake_' + Date.now() },
      fromMe: false,
      ack: 1,
      deviceType: 'web',
      hasMedia: true,
      downloadMedia: async () => ({
        mimetype: 'image/jpeg',
        filename: 'simulated-image.jpg',
        data: imageBase64,
      }),
    };
    const payload = await this.wpp['normalizeMessage'](msg);
    await this.wpp['forwardToN8n'](payload);
    return { ok: true, simulated: true, payload };
  }

  private normalizeToJid(input: string) {
    const s = (input || '').trim();
    if (/@(c|g)\.us$/.test(s)) return s;
    return s + '@c.us';
  }
}

