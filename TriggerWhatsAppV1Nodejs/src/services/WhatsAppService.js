const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

class WhatsAppService {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.qrCode = null;
        this.messageHandlers = [];
        this.readyHandlers = [];
        this.qrHandlers = [];
        this.disconnectedHandlers = [];
    }

    async initialize() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                name: 'whatsapp-session'
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            }
        });

        this.setupEventHandlers();
        
        console.log('🔄 Inicializando WhatsApp Web...');
        await this.client.initialize();
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            this.qrCode = qr;
            this.qrHandlers.forEach(handler => handler(qr));
        });

        this.client.on('ready', () => {
            this.isReady = true;
            this.qrCode = null;
            console.log('✅ WhatsApp Web está listo!');
            this.readyHandlers.forEach(handler => handler());
        });

        this.client.on('message', async (message) => {
            // Solo procesar mensajes entrantes (no enviados por nosotros)
            if (!message.fromMe) {
                const processedMessage = await this.processMessage(message);
                this.messageHandlers.forEach(handler => handler(processedMessage));
            }
        });

        this.client.on('disconnected', (reason) => {
            this.isReady = false;
            console.log('❌ WhatsApp desconectado:', reason);
            this.disconnectedHandlers.forEach(handler => handler(reason));
        });

        this.client.on('auth_failure', (msg) => {
            console.error('❌ Error de autenticación:', msg);
        });
    }

    async processMessage(message) {
        const contact = await message.getContact();
        const chat = await message.getChat();
        
        let mediaInfo = null;
        if (message.hasMedia) {
            try {
                const media = await message.downloadMedia();
                mediaInfo = {
                    mimetype: media.mimetype,
                    filename: media.filename,
                    data: media.data, // Base64 encoded
                    size: media.data ? Buffer.from(media.data, 'base64').length : 0
                };
            } catch (error) {
                console.error('Error downloading media:', error);
            }
        }

        return {
            id: message.id._serialized,
            from: message.from,
            to: message.to,
            body: message.body,
            type: message.type,
            timestamp: message.timestamp,
            isForwarded: message.isForwarded,
            isGroup: chat.isGroup,
            groupName: chat.isGroup ? chat.name : null,
            contact: {
                id: contact.id._serialized,
                name: contact.name || contact.pushname,
                number: contact.number,
                isMyContact: contact.isMyContact
            },
            media: mediaInfo,
            location: message.location || null,
            quotedMessage: message.hasQuotedMsg ? await this.getQuotedMessage(message) : null,
            links: this.extractLinks(message.body),
            mentions: message.mentionedIds || [],
            rawMessage: {
                deviceType: message.deviceType,
                isEphemeral: message.isEphemeral,
                isGif: message.isGif,
                isStarred: message.isStarred
            }
        };
    }

    async getQuotedMessage(message) {
        try {
            const quotedMsg = await message.getQuotedMessage();
            return {
                id: quotedMsg.id._serialized,
                body: quotedMsg.body,
                from: quotedMsg.from,
                type: quotedMsg.type
            };
        } catch (error) {
            console.error('Error getting quoted message:', error);
            return null;
        }
    }

    extractLinks(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.match(urlRegex) || [];
    }

    async sendMessage(number, message, mediaPath = null) {
        if (!this.isReady) {
            throw new Error('WhatsApp not ready');
        }

        try {
            // Formatear número si es necesario
            const formattedNumber = this.formatPhoneNumber(number);
            
            if (mediaPath) {
                const media = MessageMedia.fromFilePath(mediaPath);
                return await this.client.sendMessage(formattedNumber, media, { caption: message });
            } else {
                return await this.client.sendMessage(formattedNumber, message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    formatPhoneNumber(number) {
        // Remover caracteres especiales y espacios
        let formatted = number.replace(/[^\d]/g, '');
        
        // Si no tiene código de país, asumir que es México (+52)
        if (!formatted.startsWith('52') && formatted.length === 10) {
            formatted = '52' + formatted;
        }
        
        return formatted + '@c.us';
    }

    async getChats() {
        if (!this.isReady) {
            throw new Error('WhatsApp not ready');
        }
        return await this.client.getChats();
    }

    async getContacts() {
        if (!this.isReady) {
            throw new Error('WhatsApp not ready');
        }
        return await this.client.getContacts();
    }

    async disconnect() {
        if (this.client) {
            await this.client.destroy();
            this.isReady = false;
        }
    }

    isConnected() {
        return this.isReady;
    }

    getQR() {
        return this.qrCode;
    }

    // Event handlers
    onMessage(handler) {
        this.messageHandlers.push(handler);
    }

    onReady(handler) {
        this.readyHandlers.push(handler);
    }

    onQR(handler) {
        this.qrHandlers.push(handler);
    }

    onDisconnected(handler) {
        this.disconnectedHandlers.push(handler);
    }
}

module.exports = WhatsAppService;
