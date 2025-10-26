import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';


@Controller()
export class HealthController {
  private latestQrDataUrl: string | null = null;

  // Setter llamado desde el servicio (workaround simple)
  setQr(dataUrl: string | null) {
    this.latestQrDataUrl = dataUrl;
  }

  @Get('health')
  health() {
    return {
      ok: true,
      url: process.env.N8N_WEBHOOK_URL || null,
    };
  }

  @Get('qr')
  qr() {
    return { qr: this.latestQrDataUrl };
  }
}
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
