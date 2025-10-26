//IA CODE GENERATED
const axios = require('axios');
require('dotenv').config();

async function simulateIncomingMessage() {
    console.log('🤖 SIMULADOR DE MENSAJES ENTRANTES');
    console.log('Esto simula un mensaje que llega de OTRO número');
    console.log('='.repeat(50));
    console.log(process.env.WEBHOOK_URL);
    

    // Datos de mensaje simulado (como si viniera de otro contacto)
    const simulatedMessage = {
        event: 'message_received',
        timestamp: new Date().toISOString(),
        data: {
            message: {
                id: 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                from: '5215551234567@c.us', // Número diferente al tuyo
                to: process.env.YOUR_NUMBER || 'tu_numero@c.us',
                body: '¡Hola! Este es un mensaje simulado de prueba 🚀',
                type: 'chat',
                timestamp: Math.floor(Date.now() / 1000),
                isForwarded: false,
                isGroup: false,
                groupName: null,
                hasMedia: false,
                media: null,
                location: null,
                quotedMessage: null,
                links: [],
                mentions: []
            },
            contact: {
                id: '5215551234567@c.us',
                name: 'Contacto de Prueba',
                number: '5215551234567',
                isMyContact: false,
                profilePic: null
            },
            metadata: {
                source: 'whatsapp-web-js-simulator',
                version: '1.0.0',
                processed_at: new Date().toISOString(),
                simulated: true
            }
        }
    };

    try {
        console.log('📤 Enviando mensaje simulado al servidor local...');
        
        // Primero probar el servidor local
        const localResponse = await axios.post(
            'process.',
            simulatedMessage,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'simulate-message/1.0'
                },
                timeout: 5000
            }
        );

        console.log('✅ Servidor local procesó el mensaje');
     
        console.log('📊 Respuesta:', localResponse.status);

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Servidor local no está corriendo');
            console.log('🔧 Ejecuta: npm start');
            return;
        } else {
            console.log('❌ Error en servidor local:', error.message);
        }
    }

    // Esperar un poco y luego probar el webhook directo
    console.log('\n⏳ Esperando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        console.log('🎯 Enviando directamente al webhook de n8n...');
        
        const webhookResponse = await axios.post(
            process.env.WEBHOOK_URL,
            simulatedMessage,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'WhatsApp-Simulator/1.0'
                },
                timeout: 10000
            }
        );

        console.log('✅ Webhook de n8n funcionando');
        console.log('📊 Respuesta:', webhookResponse.status);
        console.log('📄 Datos:', webhookResponse.data);

    } catch (error) {
        console.log('❌ Error en webhook n8n:', error.message);
        if (error.response) {
            console.log('📊 Status:', error.response.status);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 PARA PRUEBA REAL:');
    console.log('1. Pide a alguien que te envíe un WhatsApp');
    console.log('2. O usa otro teléfono/número');
    console.log('3. NO te envíes mensajes a ti mismo');
    console.log('');
    console.log('💡 Los mensajes propios NO se detectan en WhatsApp Web');
}

// Función para simular diferentes tipos de mensajes
async function simulateMultipleMessages() {
    console.log('🎪 SIMULANDO MÚLTIPLES TIPOS DE MENSAJES\n');

    const messages = [
        {
            type: 'text',
            from: '5215551111111@c.us',
            name: 'Ana García',
            body: 'Hola, ¿cómo estás?'
        },
        {
            type: 'text',
            from: '5215552222222@c.us', 
            name: 'Carlos López',
            body: 'Mensaje de prueba con emoji 😊'
        },
        {
            type: 'group',
            from: '5215553333333@c.us',
            name: 'María Rodríguez',
            body: 'Mensaje desde grupo',
            groupName: 'Grupo de Pruebas'
        }
    ];

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        console.log(`📱 Simulando mensaje ${i + 1}/3 de ${msg.name}...`);

        const simulatedData = {
            event: 'message_received',
            timestamp: new Date().toISOString(),
            data: {
                message: {
                    id: `sim_${i}_${Date.now()}`,
                    from: msg.from,
                    to: 'tu_numero@c.us',
                    body: msg.body,
                    type: 'chat',
                    timestamp: Math.floor(Date.now() / 1000),
                    isGroup: msg.type === 'group',
                    groupName: msg.groupName || null
                },
                contact: {
                    id: msg.from,
                    name: msg.name,
                    number: msg.from.split('@')[0]
                }
            }
        };

        try {
            await axios.post(
                process.env.WEBHOOK_URL,
                simulatedData
            );
            console.log(`   ✅ Enviado exitosamente`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Esperar entre mensajes
        if (i < messages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('\n🎉 Simulación completa. Revisa n8n para ver las ejecuciones.');
}

// Función para mensaje personalizado
async function simulateCustomMessage() {
    console.log('💬 SIMULADOR DE MENSAJE PERSONALIZADO');
    console.log('='.repeat(50));
    

    // Obtener parámetros de línea de comandos
    const customMessage = process.argv[3] || '¡Hola! Este es un mensaje personalizado 🎯';
    const senderName = process.argv[4] || 'Contacto Personalizado';
    const senderNumber = process.argv[5] || '5215551234567';

    console.log('📱 Enviando mensaje personalizado:');
    console.log(`👤 De: ${senderName} (+${senderNumber})`);
    console.log(`💬 Mensaje: "${customMessage}"`);
    console.log('');

    const customData = {
        event: 'message_received',
        timestamp: new Date().toISOString(),
        data: {
            message: {
                id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                from: `${senderNumber}@c.us`,
                to: process.env.YOUR_NUMBER || 'tu_numero@c.us',
                body: customMessage,
                type: 'chat',
                timestamp: Math.floor(Date.now() / 1000),
                isForwarded: false,
                isGroup: false,
                groupName: null,
                hasMedia: false,
                media: null,
                location: null,
                quotedMessage: null,
                links: [],
                mentions: []
            },
            contact: {
                id: `${senderNumber}@c.us`,
                name: senderName,
                number: senderNumber,
                isMyContact: false,
                profilePic: null
            },
            metadata: {
                source: 'whatsapp-web-js-custom-simulator',
                version: '1.0.0',
                processed_at: new Date().toISOString(),
                simulated: true,
                custom: true
            }
        }
    };

    try {
        console.log('🎯 Enviando al webhook de n8n...');
        
        const response = await axios.post(
            process.env.WEBHOOK_URL,
            customData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'WhatsApp-Custom-Simulator/1.0'
                },
                timeout: 10000
            }
        );

        console.log('✅ ¡Mensaje personalizado enviado exitosamente!');
        console.log('📊 Status:', response.status);
        console.log('📄 Respuesta:', response.data);
        console.log('');
        console.log('🎉 Revisa n8n para ver la ejecución del workflow');

    } catch (error) {
        console.log('❌ Error enviando mensaje personalizado:', error.message);
        
        if (error.response) {
            console.log('📊 Status:', error.response.status);
            console.log('📄 Respuesta:', error.response.data);
        }

        if (error.response?.status === 404) {
            console.log('');
            console.log('🚨 Webhook no encontrado. Asegúrate de que:');
            console.log('1. El workflow esté ACTIVO en n8n');
            console.log('2. El webhook esté configurado correctamente');
            console.log('3. La URL sea: webhook/whatsapp-bot');
        }
    }
}

// Función interactiva para mensaje personalizado
async function interactiveCustomMessage() {
    const readline = require('readline');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => {
        return new Promise((resolve) => {
            rl.question(prompt, resolve);
        });
    };

    console.log('💬 CREADOR DE MENSAJE PERSONALIZADO');
    console.log('='.repeat(50));
    console.log('');

    try {
        const message = await question('💬 Escribe tu mensaje: ');
        const name = await question('👤 Nombre del remitente (opcional): ') || 'Usuario Personalizado';
        const number = await question('📱 Número del remitente (opcional): ') || '5215551234567';

        rl.close();

        console.log('');
        console.log('📋 Resumen del mensaje:');
        console.log(`👤 De: ${name} (+${number})`);
        console.log(`💬 Mensaje: "${message}"`);
        console.log('');

        // Simular el mensaje personalizado
        const customData = {
            event: 'message_received',
            timestamp: new Date().toISOString(),
            data: {
                message: {
                    id: 'interactive_' + Date.now(),
                    from: `${number}@c.us`,
                    to: 'tu_numero@c.us',
                    body: message,
                    type: 'chat',
                    timestamp: Math.floor(Date.now() / 1000),
                    isGroup: false,
                    groupName: null
                },
                contact: {
                    id: `${number}@c.us`,
                    name: name,
                    number: number
                },
                metadata: {
                    source: 'interactive-simulator',
                    simulated: true
                }
            }
        };

        console.log('🎯 Enviando mensaje personalizado...');
        
        const response = await axios.post(
            process.env.WEBHOOK_URL,
            customData,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );

        console.log('✅ ¡Mensaje enviado exitosamente!');
        console.log('🎉 Revisa n8n para ver la ejecución');

    } catch (error) {
        rl.close();
        console.log('❌ Error:', error.message);
    }
}

// Ejecutar según argumentos
const command = process.argv[2];
const hasCustomParams = process.argv.length > 3;

if (command === 'multiple') {
    simulateMultipleMessages().catch(console.error);
} else if (command === 'custom' && hasCustomParams) {
    simulateCustomMessage().catch(console.error);
} else if (command === 'custom' || command === 'interactive') {
    interactiveCustomMessage().catch(console.error);
} else if (command === 'help') {
    console.log('💬 SIMULADOR DE MENSAJES WHATSAPP - AYUDA');
    console.log('='.repeat(50));
    console.log('');
    console.log('📋 Comandos disponibles:');
    console.log('');
    console.log('1. Mensaje simple:');
    console.log('   node simulate-message.js');
    console.log('');
    console.log('2. Múltiples mensajes:');
    console.log('   node simulate-message.js multiple');
    console.log('');
    console.log('3. Mensaje personalizado (interactivo):');
    console.log('   node simulate-message.js custom');
    console.log('');
    console.log('4. Mensaje personalizado (directo):');
    console.log('   node simulate-message.js custom "Tu mensaje aquí" "Nombre" "5215551234567"');
    console.log('');
    console.log('5. Ver esta ayuda:');
    console.log('   node simulate-message.js help');
    console.log('');
    console.log('💡 Ejemplos:');
    console.log('   node simulate-message.js custom "¡Hola desde el simulador!" "Ana García" "5215559876543"');
    console.log('   node simulate-message.js custom "Prueba de emoji 😊🚀" "Carlos" "5215551111111"');
    console.log(require('dotenv').WEBHOOK_URL);
} else {
    simulateIncomingMessage().catch(console.error);
}
