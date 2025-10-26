import { Body, Controller, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto.js';
import { WhatsAppService } from './whatsapp.service.js';
import { FakeMessageService } from './fake-message.service.js';
import { WhatsAppCloudService } from './whatsapp-cloud.service.js';

@Controller('send')
export class MessagesController {
  private wppImpl: any;
  constructor(private readonly wpp: WhatsAppService, private readonly wppCloud: WhatsAppCloudService) {
    this.wppImpl = process.env.WHATSAPP_CLOUD === 'true' ? this.wppCloud : this.wpp;
  }

  @Post()
  async send(@Body() body: SendMessageDto, @Req() req: any) {
    // Auth simple opcional via API_KEY
    const expected = process.env.API_KEY || '';
    if (expected) {
      const got =
        (req.headers['x-api-key'] as string) ||
        (req.headers['authorization'] as string)?.replace(/^Bearer\s+/i, '');
      if (got !== expected) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const to = this.normalizeToJid(body.to);

    if (body.type === 'text') {
      if (!body.text) throw new HttpException('text is required for type=text', HttpStatus.BAD_REQUEST);
      try {
        const res = await this.wppImpl.sendText(to, body.text);
        return { ok: true, id: res.id._serialized };
      } catch (err: any) {
        const msg = err?.message || 'Error sending message';
        if (/Timeout|ready|inicializ/i.test(msg)) {
          throw new HttpException('WhatsApp client not ready: ' + msg, HttpStatus.SERVICE_UNAVAILABLE);
        }
        throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    if (!body.media) {
      throw new HttpException('media is required for type=image/audio', HttpStatus.BAD_REQUEST);
    }

    // image | audio (ambos via base64)
      try {
      const res = await this.wppImpl.sendMedia(
        to,
        body.media.mimetype,
        body.media.base64,
        body.media.filename,
        body.media.caption // solo aplica a imagen
      );
      return { ok: true, id: (res as any).id?._serialized ?? true };
    } catch (err: any) {
      const msg = err?.message || 'Error sending media';
      if (/Timeout|ready|inicializ/i.test(msg)) {
        throw new HttpException('WhatsApp client not ready: ' + msg, HttpStatus.SERVICE_UNAVAILABLE);
      }
      throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private normalizeToJid(input: string) {
    const s = (input || '').trim();
    if (/@(c|g)\.us$/.test(s)) return s;
    return s + '@c.us';
  }
}

// Controlador para simular mensajes entrantes
@Controller('simulate-message')
export class SimulateMessageController {
  constructor(private readonly fakeMessageService: FakeMessageService) {}

  // Ruta para simular mensaje de texto
  @Post('text')
  async simulateText(@Body() body: { from: string; text: string }) {
    // Llama al servicio para simular el mensaje de texto
    return await this.fakeMessageService.simulateTextMessage(body.from, body.text);
  }

  // Ruta para simular mensaje de audio
  @Post('audio')
  async simulateAudio(@Body() body: { from: string; audioUrl: string }) {
    // Llama al servicio para simular el mensaje de audio
    return await this.fakeMessageService.simulateAudioMessage(body.from, body.audioUrl);
  }

  // Ruta para simular mensaje de imagen
  @Post('image')
  async simulateImage(@Body() body: { from: string; imageUrl: string }) {
    // Llama al servicio para simular el mensaje de imagen
    return await this.fakeMessageService.simulateImageMessage(body.from, body.imageUrl);
  }
}