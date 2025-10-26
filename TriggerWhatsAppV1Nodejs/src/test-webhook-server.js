//IA CODE GENERATED

const express = require('express');
const bodyParser = require('body-parser');

class TestWebhookServer {
    constructor(port = 3001) {
        this.app = express();
        this.port = port;
        this.receivedMessages = [];
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        
        // CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            next();
        });

        // Logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        // Endpoint principal para recibir webhooks de WhatsApp
        this.app.post('/webhook/whatsapp', (req, res) => {
            const message = req.body;
            
            console.log('🔔 Webhook recibido:', {
                event: message.event,
                messageId: message.data?.message?.id,
                from: message.data?.message?.from,
                body: message.data?.message?.body?.substring(0, 50) + '...',
                timestamp: message.timestamp
            });

            // Guardar el mensaje
            this.receivedMessages.push({
                ...message,
                received_at: new Date().toISOString()
            });

            // Mantener solo los últimos 100 mensajes
            if (this.receivedMessages.length > 100) {
                this.receivedMessages = this.receivedMessages.slice(-100);
            }

            // Responder con éxito
            res.status(200).json({
                success: true,
                message: 'Webhook received successfully',
                messageId: message.data?.message?.id,
                timestamp: new Date().toISOString()
            });
        });

        // Endpoint para ver los mensajes recibidos
        this.app.get('/messages', (req, res) => {
            const limit = parseInt(req.query.limit) || 10;
            const messages = this.receivedMessages.slice(-limit).reverse();
            
            res.json({
                total: this.receivedMessages.length,
                limit,
                messages
            });
        });

        // Endpoint para obtener un mensaje específico
        this.app.get('/messages/:id', (req, res) => {
            const messageId = req.params.id;
            const message = this.receivedMessages.find(m => 
                m.data?.message?.id === messageId
            );

            if (message) {
                res.json(message);
            } else {
                res.status(404).json({ error: 'Message not found' });
            }
        });

        // Endpoint para limpiar mensajes
        this.app.delete('/messages', (req, res) => {
            const count = this.receivedMessages.length;
            this.receivedMessages = [];
            
            res.json({
                success: true,
                message: `Cleared ${count} messages`
            });
        });

        // Endpoint de estado
        this.app.get('/status', (req, res) => {
            res.json({
                status: 'running',
                messages_received: this.receivedMessages.length,
                last_message: this.receivedMessages.length > 0 ? 
                    this.receivedMessages[this.receivedMessages.length - 1].received_at : 
                    null,
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });

        // Endpoint para simular envío a API externa
        this.app.post('/api/external', (req, res) => {
            console.log('📡 Simulando envío a API externa:', req.body);
            
            // Simular procesamiento
            setTimeout(() => {
                res.json({
                    success: true,
                    message: 'Processed by external API',
                    data: req.body,
                    processed_at: new Date().toISOString()
                });
            }, 100);
        });

        // Página web simple para monitorear
        this.app.get('/', (req, res) => {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>WhatsApp Webhook Monitor</title>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        .container { max-width: 800px; margin: 0 auto; }
                        .message { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
                        .header { background: #f5f5f5; padding: 5px 10px; border-radius: 3px; margin-bottom: 10px; }
                        pre { background: #f8f8f8; padding: 10px; border-radius: 3px; overflow-x: auto; }
                        .btn { background: #007cba; color: white; padding: 10px 15px; border: none; border-radius: 3px; cursor: pointer; margin: 5px; }
                        .btn:hover { background: #005a8a; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>📱 WhatsApp Webhook Monitor</h1>
                        <p>Mensajes recibidos: <strong id="messageCount">${this.receivedMessages.length}</strong></p>
                        
                        <button class="btn" onclick="loadMessages()">🔄 Actualizar</button>
                        <button class="btn" onclick="clearMessages()">🗑️ Limpiar</button>
                        
                        <div id="messages"></div>
                    </div>

                    <script>
                        function loadMessages() {
                            fetch('/messages?limit=10')
                                .then(response => response.json())
                                .then(data => {
                                    document.getElementById('messageCount').textContent = data.total;
                                    const messagesDiv = document.getElementById('messages');
                                    messagesDiv.innerHTML = '';
                                    
                                    data.messages.forEach(msg => {
                                        const messageDiv = document.createElement('div');
                                        messageDiv.className = 'message';
                                        messageDiv.innerHTML = \`
                                            <div class="header">
                                                <strong>\${msg.data?.message?.contact?.name || 'Sin nombre'}</strong> - 
                                                \${new Date(msg.received_at).toLocaleString()}
                                            </div>
                                            <p><strong>De:</strong> \${msg.data?.message?.from}</p>
                                            <p><strong>Mensaje:</strong> \${msg.data?.message?.body || 'Sin texto'}</p>
                                            <p><strong>Tipo:</strong> \${msg.data?.message?.type}</p>
                                            \${msg.data?.message?.media ? '<p><strong>📎 Contiene media</strong></p>' : ''}
                                        \`;
                                        messagesDiv.appendChild(messageDiv);
                                    });
                                });
                        }

                        function clearMessages() {
                            if (confirm('¿Estás seguro de que quieres limpiar todos los mensajes?')) {
                                fetch('/messages', { method: 'DELETE' })
                                    .then(() => loadMessages());
                            }
                        }

                        // Cargar mensajes cada 5 segundos
                        setInterval(loadMessages, 5000);
                        loadMessages();
                    </script>
                </body>
                </html>
            `);
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🎯 Test Webhook Server iniciado en http://localhost:${this.port}`);
            console.log(`📊 Monitor: http://localhost:${this.port}`);
            console.log(`📡 Webhook URL: http://localhost:${this.port}/webhook/whatsapp`);
        });
    }
}

// Si este archivo se ejecuta directamente, iniciar el servidor
if (require.main === module) {
    const server = new TestWebhookServer();
    server.start();
}

module.exports = TestWebhookServer;
