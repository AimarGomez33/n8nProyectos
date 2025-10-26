//aUTHOR = @AimarJairGomezDaniel
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const WhatsAppService = require('./services/WhatsAppService');
const WebhookService = require('./services/WebhookService');
const ApiService = require('./services/ApiService');

class WhatsAppWebhookTrigger {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || process.env.PORT;
        this.host = process.env.HOST || 'localhost';
        
        this.whatsappService = new WhatsAppService();
        this.webhookService = new WebhookService();
        this.apiService = new ApiService();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWhatsAppEvents();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        
        // Middleware para logging
        this.app.use((req, res, next) => {
            if (process.env.DEBUG === 'true') {
                console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            }
            next();
        });
    }

    setupRoutes() {
        // Página principal de información
        this.app.get('/', (req, res) => {
            const isConnected = this.whatsappService.isConnected();
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>WhatsApp Webhook Trigger</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                        }
                        .container {
                            background: rgba(255,255,255,0.1);
                            backdrop-filter: blur(10px);
                            border-radius: 20px;
                            padding: 40px;
                            max-width: 800px;
                            width: 90%;
                            border: 1px solid rgba(255,255,255,0.2);
                        }
                        .header { text-align: center; margin-bottom: 30px; }
                        .status {
                            display: inline-block;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-weight: bold;
                            margin: 10px 0;
                        }
                        .connected { background: #10b981; }
                        .disconnected { background: #ef4444; }
                        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
                        .card {
                            background: rgba(255,255,255,0.1);
                            border-radius: 15px;
                            padding: 20px;
                            border: 1px solid rgba(255,255,255,0.2);
                        }
                        .card h3 { margin-bottom: 15px; color: #a7f3d0; }
                        .endpoint { margin: 8px 0; font-family: monospace; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 5px; }
                        .btn {
                            display: inline-block;
                            background: rgba(255,255,255,0.2);
                            color: white;
                            padding: 10px 20px;
                            border-radius: 8px;
                            text-decoration: none;
                            margin: 5px;
                            border: 1px solid rgba(255,255,255,0.3);
                            transition: all 0.3s;
                        }
                        .btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
                        .refresh { float: right; font-size: 12px; opacity: 0.7; }
                        @media (max-width: 768px) { .container { padding: 20px; } .grid { grid-template-columns: 1fr; } }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📱 WhatsApp Webhook Trigger</h1>
                            <div class="status ${isConnected ? 'connected' : 'disconnected'}">
                                ${isConnected ? '🟢 WhatsApp Conectado' : '🔴 WhatsApp Desconectado'}
                            </div>
                            <p>Sistema funcionando desde: ${new Date().toLocaleString()}</p>
                        </div>

                        <div class="grid">
                            <div class="card">
                                <h3>🔗 Endpoints API</h3>
                                <div class="endpoint">GET /status</div>
                                <div class="endpoint">POST /send-message</div>
                                <div class="endpoint">GET /qr</div>
                                <div class="endpoint">POST /disconnect</div>
                            </div>

                            <div class="card">
                                <h3>📊 Enlaces Útiles</h3>
                                <a href="/status" class="btn">Ver Estado JSON</a>
                                ${!isConnected ? '<a href="/qr" class="btn">Ver Código QR</a>' : ''}
                                <a href="http://localhost:3001" class="btn" target="_blank">Monitor Webhooks</a>
                            </div>

                            <div class="card">
                                <h3>⚙️ Configuración</h3>
                                <p><strong>Puerto:</strong> ${process.env.PORT || 3000}</p>
                                <p><strong>Webhook URL:</strong></p>
                                <div class="endpoint">${process.env.WEBHOOK_URL || 'No configurado'}</div>
                                <p><strong>Debug:</strong> ${process.env.DEBUG === 'true' ? 'Activado' : 'Desactivado'}</p>
                            </div>

                            <div class="card">
                                <h3>📝 Ejemplo de Uso</h3>
                                <p>Enviar mensaje vía API:</p>
                                <div class="endpoint">
curl -X POST http://localhost:${process.env.PORT || 3000}/send-message \\<br>
-H "Content-Type: application/json" \\<br>
-d '{"number":"521234567890","message":"Hola!"}'
                                </div>
                            </div>
                        </div>

                        ${!isConnected ? `
                        <div class="card" style="background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.3);">
                            <h3>🚨 WhatsApp No Conectado</h3>
                            <p>Para conectar WhatsApp:</p>
                            <ol style="margin: 15px 0; padding-left: 20px;">
                                <li>Ve a <a href="/qr" style="color: #fecaca;">/qr</a> para obtener el código QR</li>
                                <li>Abre WhatsApp en tu teléfono</li>
                                <li>Ve a Configuración > Dispositivos vinculados</li>
                                <li>Escanea el código QR</li>
                            </ol>
                        </div>
                        ` : `
                        <div class="card" style="background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.3);">
                            <h3>✅ WhatsApp Conectado</h3>
                            <p>✓ Los mensajes entrantes se envían automáticamente al webhook</p>
                            <p>✓ Puedes enviar mensajes usando la API</p>
                            <p>✓ Monitor disponible en <a href="http://localhost: 3000" target="_blank" style="color: #a7f3d0;">localhost:3000</a></p>
                        </div>
                        `}

                        <div class="refresh">
                            Actualizado: ${new Date().toLocaleTimeString()} | 
                            <a href="/" style="color: inherit;">🔄 Refrescar</a>
                        </div>
                    </div>

                    <script>
                        // Auto-refresh cada 30 segundos
                        setTimeout(() => location.reload(), 30000);
                    </script>
                </body>
                </html>
            `);
        });

        // Ruta de estado
        this.app.get('/status', (req, res) => {
            res.json({
                status: 'running',
                whatsapp_connected: this.whatsappService.isConnected(),
                timestamp: new Date().toISOString()
            });
        });

        // Ruta para enviar mensajes
        this.app.post('/send-message', async (req, res) => {
            try {
                const { number, message, media } = req.body;
                
                if (!number || !message) {
                    return res.status(400).json({
                        error: 'number and message are required'
                    });
                }

                const result = await this.whatsappService.sendMessage(number, message, media);
                res.json({ success: true, result });
            } catch (error) {
                console.error('Error sending message:', error);
                res.status(500).json({ 
                    error: 'Failed to send message',
                    details: error.message 
                });
            }
        });

        // Ruta para obtener QR (en caso de no estar autenticado)
        this.app.get('/qr', (req, res) => {
            const qr = this.whatsappService.getQR();
            if (qr) {
                res.json({ qr });
            } else {
                res.json({ message: 'Already authenticated or QR not available' });
            }
        });

        // Ruta para webhook de prueba
        this.app.post('/webhook/test', (req, res) => {
            console.log('Test webhook received:', req.body);
            res.json({ received: true, data: req.body });
        });

        // Ruta para desconectar WhatsApp
        this.app.post('/disconnect', async (req, res) => {
            try {
                await this.whatsappService.disconnect();
                res.json({ success: true, message: 'WhatsApp disconnected' });
            } catch (error) {
                res.status(500).json({ 
                    error: 'Failed to disconnect',
                    details: error.message 
                });
            }
        });
    }

    setupWhatsAppEvents() {
        // Cuando se recibe un mensaje
        this.whatsappService.onMessage(async (message) => {
            try {
                console.log('� ='.repeat(50));
                console.log('�📱 NUEVO MENSAJE RECIBIDO:');
                console.log('   👤 De:', message.contact?.name || 'Sin nombre');
                console.log('   📞 Número:', message.from);
                console.log('   💬 Mensaje:', message.body?.substring(0, 100));
                console.log('   📅 Timestamp:', new Date().toISOString());
                console.log('   🔗 Webhook URL:', process.env.WEBHOOK_URL || 'NO CONFIGURADO');
                console.log('🔔 ='.repeat(50));

                // Verificar configuración antes de enviar
                if (!process.env.WEBHOOK_URL) {
                    console.log('⚠️ WEBHOOK_URL no configurado en .env');
                    return;
                }

                // Enviar por webhook con logs detallados
                console.log('📤 Iniciando envío a webhook...');
                const webhookResult = await this.webhookService.sendToWebhook(message);
                console.log('✅ Webhook enviado:', webhookResult ? 'Éxito' : 'Sin respuesta');
                
                // También enviar por API REST si está configurado
                console.log('📡 Iniciando envío a APIs...');
                await this.apiService.sendMessage(message);
                console.log('✅ APIs procesadas');
                
            } catch (error) {
                console.error('❌ ERROR PROCESANDO MENSAJE:');
                console.error('   Error:', error.message);
                console.error('   Stack:', error.stack);
            }
        });

        // Eventos de conexión
        this.whatsappService.onReady(() => {
            console.log('✅ WhatsApp Web is ready!');
        });

        this.whatsappService.onQR((qr) => {
            console.log('📱 QR Code received, scan it with your phone:');
            qrcode.generate(qr, { small: true });
        });

        this.whatsappService.onDisconnected((reason) => {
            console.log('❌ WhatsApp disconnected:', reason);
        });
    }

    async start() {
        try {
            // Inicializar WhatsApp
            await this.whatsappService.initialize();
            
            // Iniciar servidor
            this.app.listen(this.port, this.host, () => {
                console.log(`🚀 Servidor iniciado en http://${this.host}:${this.port}`);
                console.log(`📊 Estado: http://${this.host}:${this.port}/status`);
                console.log(`📱 QR Code: http://${this.host}:${this.port}/qr`);
            });
        } catch (error) {
            console.error('❌ Error starting application:', error);
            process.exit(1);
        }
    }
}

// Iniciar la aplicación
const app = new WhatsAppWebhookTrigger();
app.start();

// Manejar cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando aplicación...');
    await app.whatsappService.disconnect();
    process.exit(0);
});

module.exports = WhatsAppWebhookTrigger;