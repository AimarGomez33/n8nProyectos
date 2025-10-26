import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsAppCloudService {
  private readonly logger = new Logger(WhatsAppCloudService.name);
  private readonly token = process.env.WHATSAPP_TOKEN || '';
  private readonly phoneId = process.env.WHATSAPP_PHONE_ID || '';
  private readonly apiVersion = process.env.WHATSAPP_API_VERSION || 'v17.0';

  private get baseUrl() {
    return `https://graph.facebook.com/${this.apiVersion}/${this.phoneId}`;
  }

  async sendText(to: string, text: string) {
    if (!this.token || !this.phoneId) {
      throw new Error('WHATSAPP_TOKEN or WHATSAPP_PHONE_ID not configured');
    }

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    };

    try {
      const res = await axios.post(`${this.baseUrl}/messages`, payload, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
  const msgId = res.data && res.data.messages && res.data.messages[0] ? res.data.messages[0].id : undefined;
  this.logger.log('Enviado por Cloud API: ' + (msgId || JSON.stringify(res.data)));
  // Return an object compatible with whatsapp-web.js send result
  if (msgId) return { id: { _serialized: msgId } };
  return { id: { _serialized: JSON.stringify(res.data) } };
    } catch (err: any) {
      this.logger.error('Error enviando por Cloud API: ' + (err.response?.data || err.message));
      throw err;
    }
  }

  // Minimal media support: expects base64 data and mimetype. For production, you'd upload media first.
  async sendMedia(to: string, mimetype: string, base64: string, filename?: string, caption?: string) {
    if (!this.token || !this.phoneId) {
      throw new Error('WHATSAPP_TOKEN or WHATSAPP_PHONE_ID not configured');
    }

    // Quick path: attempt to send as media object with raw base64 (Graph API requires media upload step).
    // We'll throw instructive error so caller knows to implement proper upload flow if needed.
    throw new Error('sendMedia no implementado para Cloud API en este adaptador. Implementar upload de media primero.');
  }
}
