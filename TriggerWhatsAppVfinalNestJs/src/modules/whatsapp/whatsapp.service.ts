import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import * as qrcodeTerminal from 'qrcode-terminal';
import * as QR from 'qrcode';
import { Client, LocalAuth, Message, MessageMedia } from 'whatsapp-web.js';
import { HealthController } from '../../presentation/qr.controller.js';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private client!: Client;
  private ready = false;

  // Una sola promesa compartida para “ready”
  private readyPromise!: Promise<void>;
  private readyResolve!: () => void;

  private readonly logger = new Logger(WhatsAppService.name);
  private readonly webhook = process.env.N8N_WEBHOOK_URL || '';
  private readonly puppeteerArgs: string[] = (
    process.env.PUPPETEER_NO_SANDBOX === 'true'
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : []
  );

  constructor(private readonly healthController: HealthController) {}

  async onModuleInit() {
    // Crea la promesa de ready
    this.readyPromise = new Promise<void>((resolve) => (this.readyResolve = resolve));

    const puppeteerOptions: any = { args: this.puppeteerArgs };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      this.logger.log('Usando Puppeteer executablePath: ' + process.env.PUPPETEER_EXECUTABLE_PATH);
    }

    // Un solo cliente por proceso
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: 'session' }),
      puppeteer: puppeteerOptions,
    });

    this.wireEvents();

    try {
      this.logger.log('Inicializando cliente de WhatsApp...');
      await this.client.initialize(); // NO pongas aquí timeouts artificiales
    } catch (err) {
      this.logger.error('Error inicializando WhatsApp', err as any);
      // Si falla aquí, dejamos la promesa pendiente; podrás reintentar con reInit()
    }
  }

  // Suscripción de eventos
  private wireEvents() {
    // Útiles para depurar progreso de Puppeteer/WA
    this.client.on('loading_screen', (pct, msg) =>
      this.logger.log(`loading_screen ${pct}% - ${msg}`),
    );
    this.client.on('change_state', (state) =>
      this.logger.log(`Estado WA: ${state}`),
    );

    this.client.on('qr', async (qr) => {
      this.logger.log('QR recibido. Escanéalo con WhatsApp.');
      qrcodeTerminal.generate(qr, { small: true });
      try {
        const dataUrl = await QR.toDataURL(qr, { type: 'image/png' });
        this.healthController.setQr(dataUrl);
      } catch (e: any) {
        this.logger.warn('No se pudo generar DataURL del QR: ' + e.message);
        this.healthController.setQr('QR:' + qr); // fallback
      }
    });

    this.client.on('ready', () => {
      this.logger.log('✅ WhatsApp listo');
      this.ready = true;
      this.healthController.setQr(null);
      if (this.readyResolve) this.readyResolve();
    });

    this.client.on('auth_failure', (m) => this.logger.error('Auth failure: ' + m));

    this.client.on('disconnected', async (reason) => {
      this.logger.warn('Desconectado: ' + reason);
      this.ready = false;
      // Resetea la promesa y reintenta
      this.readyPromise = new Promise<void>((resolve) => (this.readyResolve = resolve));
      try {
        await this.reInit();
      } catch (e: any) {
        this.logger.error('Fallo al re-inicializar: ' + e.message);
      }
    });

    this.client.on('message', async (msg: Message) => {
      try {
        const payload = await this.normalizeMessage(msg);
        if (payload) await this.forwardToN8n(payload);
      } catch (err) {
        this.logger.error('Error procesando mensaje', err as any);
      }
    });
  }

  // Re-inicialización sencilla para “disconnected”
  private async reInit() {
    try {
      await this.client.destroy().catch(() => undefined);
    } catch (_) {}
    const puppeteerOptions: any = { args: this.puppeteerArgs };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: 'session' }),
      puppeteer: puppeteerOptions,
    });
    this.wireEvents();
    this.logger.log('Reinicializando cliente de WhatsApp...');
    await this.client.initialize();
  }

  private async normalizeMessage(msg: Message) {
    const base: any = {
      platform: 'whatsapp-web.js',
      from: msg.from,
      to: msg.to,
      timestamp: msg.timestamp,
      type: msg.type,
      id: msg.id._serialized,
      fromMe: msg.fromMe,
      raw: { ack: msg.ack, deviceType: msg.deviceType },
    };

    if (msg.type === 'chat') {
      base.text = msg.body;
      return base;
    }

    let media: MessageMedia | null = null;
    try {
      if (msg.hasMedia) media = await msg.downloadMedia();
    } catch (e: any) {
      this.logger.warn('No se pudo descargar media: ' + e.message);
    }

    if (media) {
      base.media = {
        mimetype: media.mimetype,
        filename: (media as any).filename || null,
        base64: media.data,
      };
    }

    if (msg.type === 'ptt') base.subtype = 'voice';

    return base; // <- IMPORTANTE: siempre retornar
  }

  private async forwardToN8n(payload: any) {
    if (!this.webhook) {
      this.logger.warn('N8N_WEBHOOK_URL no configurado; omitiendo envío.');
      return;
    }
    try {
      await axios.post(this.webhook, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 12000,
      });
      this.logger.log(`➡️ Enviado a n8n (${payload.type})`);
    } catch (err: any) {
      this.logger.error('Error enviando a n8n: ' + (err.response?.data || err.message));
    }
  }

  // Exponer una sola forma de “esperar ready”
  private async waitUntilReady() {
    if (this.ready) return;
    await this.readyPromise; // sin timeouts artificiales aquí
  }

  // API pública
  async sendText(to: string, text: string) {
    await this.waitUntilReady();
    return this.client.sendMessage(to, text);
  }

  async sendMedia(
    to: string,
    mimetype: string,
    base64: string,
    filename?: string,
    caption?: string,
  ) {
    await this.waitUntilReady();
    const media = new MessageMedia(mimetype, base64, filename || undefined);
    return this.client.sendMessage(to, media, { caption });
  }
}
