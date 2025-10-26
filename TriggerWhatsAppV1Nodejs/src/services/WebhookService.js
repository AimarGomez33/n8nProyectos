//AUTHOR = @AimarJairGomezDaniel
const axios = require('axios');

class WebhookService {
    constructor() {
        this.webhookUrl = process.env.WEBHOOK_URL;
        this.timeout = 10000; // 10 segundos
        this.retries = 3;
    }

   //Ia code fragment 

    formatWebhookPayload(message) {
        return {
            event: 'message_received',
            timestamp: new Date().toISOString(),
            data: {
                message: {
                    id: message.id,
                    from: message.from,
                    to: message.to,
                    body: message.body,
                    type: message.type,
                    timestamp: message.timestamp,
                    isForwarded: message.isForwarded,
                    isGroup: message.isGroup,
                    groupName: message.groupName,
                    hasMedia: !!message.media,
                    media: message.media,
                    location: message.location,
                    quotedMessage: message.quotedMessage,
                    links: message.links,
                    mentions: message.mentions
                },
                contact: message.contact,
                metadata: {
                    source: 'whatsapp-web-js',
                    version: '1.0.0',
                    processed_at: new Date().toISOString()
                }
            }
        };
    }

    async sendCustomWebhook(url, data, headers = {}) {
        try {
            const response = await axios.post(url, data, {
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'WhatsApp-Webhook-Trigger/1.0',
                    ...headers
                }
            });

            console.log('✅ Custom webhook enviado:', url);
            console.log(process.env.WEBHOOK_URL)
            return response.data;
        } catch (error) {
            console.error('❌ Error enviando custom webhook:', error.message);
            throw error;
        }
    }

    // Webhook para diferentes eventos
    async sendStatusWebhook(status, data = {}) {
        if (!this.webhookUrl) return;

        const payload = {
            event: 'status_change',
            timestamp: new Date().toISOString(),
            data: {
                status,
                ...data,
                metadata: {
                    source: 'whatsapp-web-js',
                    version: '1.0.0'
                }
            }
        };

        try {
            await axios.post(this.webhookUrl, payload, {
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Event-Type': 'status',
                    ...(process.env.API_KEY && { 'Authorization': `Bearer ${process.env.API_KEY}` })
                }
            });
            console.log('✅ Status webhook enviado:', status);
        } catch (error) {
            console.error('❌ Error enviando status webhook:', error.message);
        }
    }

    // Función para enviar respuesta desde n8n
    async sendResponseFromN8n(webhookData) {
        try {
            console.log('📥 PROCESANDO RESPUESTA DESDE N8N:');
            console.log('   📱 Para:', webhookData.number);
            console.log('   💬 Mensaje:', webhookData.message);
            
            // Aquí puedes agregar lógica adicional para procesar la respuesta
            // Por ejemplo, guardar en base de datos, validar formato, etc.
            
            return {
                success: true,
                processed: true,
                timestamp: new Date().toISOString(),
                data: webhookData
            };
        } catch (error) {
            console.error('❌ Error procesando respuesta de n8n:', error.message);
            throw error;
        }
    }

    //Fin IA code fragment

    // Función para crear webhook de respuesta personalizada
    async sendCustomResponse(messageData, responseText) {
        if (!this.webhookUrl) return;

        const payload = {
            event: 'auto_response',
            timestamp: new Date().toISOString(),
            data: {
                original_message: messageData.message,
                response: {
                    to: messageData.message.from,
                    text: responseText,
                    timestamp: new Date().toISOString()
                },
                contact: messageData.contact,
                metadata: {
                    source: 'whatsapp-auto-response',
                    version: '1.0.0'
                }
            }
        };

        try {
            const response = await axios.post(this.webhookUrl, payload, {
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Event-Type': 'auto-response'
                }
            });
            
            console.log('✅ Respuesta automática enviada al webhook');
            return response.data;
        } catch (error) {
            console.error('❌ Error enviando respuesta automática:', error.message);
            throw error;
        }
    }

    setWebhookUrl(url) {
        this.webhookUrl = url;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = WebhookService;
