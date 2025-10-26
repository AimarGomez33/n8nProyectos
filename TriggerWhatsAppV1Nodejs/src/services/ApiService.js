//IA CODE GENERATED
const axios = require('axios');

class ApiService {
    constructor() {
        this.apiEndpoints = this.loadApiEndpoints();
        this.timeout = 10000;
    }

    loadApiEndpoints() {
        // Cargar endpoints desde variables de entorno o configuración
        const endpoints = [];
        
        // Endpoint principal
        if (process.env.API_ENDPOINT) {
            endpoints.push({
                name: 'primary',
                url: process.env.API_ENDPOINT,
                headers: {
                    'Content-Type': 'application/json',
                    ...(process.env.API_KEY && { 'Authorization': `Bearer ${process.env.API_KEY}` })
                },
                enabled: true
            });
        }

        // Endpoints adicionales (pueden configurarse múltiples)
        for (let i = 1; i <= 5; i++) {
            const url = process.env[`API_ENDPOINT_${i}`];
            const key = process.env[`API_KEY_${i}`];
            
            if (url) {
                endpoints.push({
                    name: `endpoint_${i}`,
                    url: url,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(key && { 'Authorization': `Bearer ${key}` })
                    },
                    enabled: true
                });
            }
        }

        return endpoints;
    }

    async sendMessage(message) {
        if (this.apiEndpoints.length === 0) {
            console.log('⚠️ No API endpoints configured, skipping API send');
            return;
        }

        const promises = this.apiEndpoints
            .filter(endpoint => endpoint.enabled)
            .map(endpoint => this.sendToEndpoint(endpoint, message));

        try {
            const results = await Promise.allSettled(promises);
            this.logResults(results, message.id);
        } catch (error) {
            console.error('❌ Error sending to API endpoints:', error.message);
        }
    }

    async sendToEndpoint(endpoint, message) {
        try {
            const payload = this.formatApiPayload(message);
            
            console.log(`📤 Enviando a API ${endpoint.name}:`, endpoint.url);
            
            const response = await axios.post(endpoint.url, payload, {
                timeout: this.timeout,
                headers: {
                    ...endpoint.headers,
                    'X-Message-Id': message.id,
                    'X-Source': 'whatsapp-webhook-trigger'
                }
            });

            console.log(`✅ API ${endpoint.name} respondió:`, response.status);
            return { endpoint: endpoint.name, success: true, data: response.data };
        } catch (error) {
            console.error(`❌ Error en API ${endpoint.name}:`, error.message);
            return { 
                endpoint: endpoint.name, 
                success: false, 
                error: error.message,
                status: error.response?.status 
            };
        }
    }

    formatApiPayload(message) {
        return {
            whatsapp_message: {
                id: message.id,
                from: message.from,
                to: message.to,
                body: message.body,
                type: message.type,
                timestamp: new Date(message.timestamp * 1000).toISOString(),
                is_forwarded: message.isForwarded,
                is_group: message.isGroup,
                group_name: message.groupName,
                contact: {
                    id: message.contact.id,
                    name: message.contact.name,
                    number: message.contact.number,
                    is_my_contact: message.contact.isMyContact
                },
                media: message.media ? {
                    mimetype: message.media.mimetype,
                    filename: message.media.filename,
                    size: message.media.size,
                    // No incluir data por defecto (muy pesado), solo metadatos
                    has_data: !!message.media.data
                } : null,
                location: message.location,
                quoted_message: message.quotedMessage,
                links: message.links,
                mentions: message.mentions
            },
            metadata: {
                received_at: new Date().toISOString(),
                source: 'whatsapp-web-js',
                version: '1.0.0',
                trigger_type: 'message_received'
            }
        };
    }

    // Método para enviar solo metadatos del media (sin el archivo completo)
    async sendMediaMetadata(message) {
        if (!message.media) return;

        const endpoints = this.apiEndpoints.filter(endpoint => endpoint.enabled);
        
        for (const endpoint of endpoints) {
            try {
                const payload = {
                    media_received: {
                        message_id: message.id,
                        from: message.from,
                        media: {
                            mimetype: message.media.mimetype,
                            filename: message.media.filename,
                            size: message.media.size
                        },
                        timestamp: new Date().toISOString()
                    }
                };

                await axios.post(`${endpoint.url}/media`, payload, {
                    timeout: this.timeout,
                    headers: endpoint.headers
                });

                console.log(`✅ Media metadata enviado a ${endpoint.name}`);
            } catch (error) {
                console.error(`❌ Error enviando media metadata a ${endpoint.name}:`, error.message);
            }
        }
    }

    // Método para enviar el archivo de media completo si se solicita
    async sendMediaFile(messageId, endpoint = null) {
        // Este método podría implementarse para enviar archivos grandes
        // bajo demanda usando un endpoint específico
        console.log('📎 Media file sending not implemented yet');
    }

    logResults(results, messageId) {
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;

        console.log(`📊 Resultados API para mensaje ${messageId}:`);
        console.log(`   ✅ Exitosos: ${successful}`);
        console.log(`   ❌ Fallidos: ${failed}`);

        if (process.env.DEBUG === 'true') {
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    console.log(`   ${index + 1}. ${result.value.endpoint}: ${result.value.success ? '✅' : '❌'}`);
                } else {
                    console.log(`   ${index + 1}. Error: ${result.reason}`);
                }
            });
        }
    }

    addEndpoint(name, url, headers = {}) {
        this.apiEndpoints.push({
            name,
            url,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            enabled: true
        });
    }

    removeEndpoint(name) {
        this.apiEndpoints = this.apiEndpoints.filter(endpoint => endpoint.name !== name);
    }

    toggleEndpoint(name, enabled) {
        const endpoint = this.apiEndpoints.find(e => e.name === name);
        if (endpoint) {
            endpoint.enabled = enabled;
        }
    }

    getEndpoints() {
        return this.apiEndpoints.map(e => ({
            name: e.name,
            url: e.url,
            enabled: e.enabled
        }));
    }
}

module.exports = ApiService;
