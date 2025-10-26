import { Controller, Get, Res } from '@nestjs/common';

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

  @Get('ui/qr')
  getQrUi(@Res() res: any) {
    if (!this.latestQrDataUrl) {
      return res.status(200).type('html').send('<h3>QR no disponible</h3>');
    }

    const qrValue = this.latestQrDataUrl as string;
    const isDataUrl = qrValue.startsWith('data:');

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>QR</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px} .center{display:flex;flex-direction:column;align-items:center;gap:12px}</style>
  </head>
  <body>
    <div class="center">
      <h2>Escanea este QR con WhatsApp</h2>
      ${isDataUrl ? `<img src="${qrValue}" alt="QR"/>` : `<div id="qrcode"></div><pre>${escapeHtml(qrValue)}</pre>`}
      <p>Si tu móvil no reconoce el código, abre esta página en el navegador de tu móvil y prueba a escanearla directamente.</p>
    </div>
    ${isDataUrl ? '' : `<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <script>new QRCode(document.getElementById('qrcode'), {text: ${JSON.stringify(qrValue)}, width:256, height:256});</script>`}
  </body>
</html>`;

    return res.status(200).type('html').send(html);
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as any)[c]);
}