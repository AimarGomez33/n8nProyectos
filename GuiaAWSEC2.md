🚀 GUÍA COMPLETA: DEPLOY EN AWS EC2
=====================================

⚠️  ADVERTENCIA INICIAL:
========================
- Tiempo estimado: 1-2 horas
- Conocimientos requeridos: Básicos de Linux/terminal
- Complejidad: Media-Alta
- ¿Seguro que no prefieres Railway (2 minutos)?

🎯 CUÁNDO USAR EC2:
==================
✅ SI:
- Necesitas control total del servidor
- Tu app manejará miles de usuarios
- Quieres aprender DevOps
- Planeas tener múltiples servicios

❌ NO SI:
- Solo quieres que funcione rápido
- Prefieres simplicidad
- Es tu primera vez con servidores
- Solo necesitas webhook para n8n

📋 PASOS DETALLADOS (SI DECIDES CONTINUAR):
==========================================

FASE 1: CREAR INSTANCIA EC2
---------------------------
1. Ve a: https://aws.amazon.com/console/
2. Busca "EC2" en servicios
3. Click "Launch Instance"
4. Configuración:
   ┌─────────────────────────────────────┐
   │ Name: whatsapp-webhook-bot          │
   │ OS: Ubuntu Server 22.04 LTS (Free) │
   │ Instance Type: t2.micro (Free Tier)│
   │ Key Pair: Create new (descarga .pem)│
   │ Security Group: Create new          │
   │   - SSH (22) from Your IP           │
   │   - HTTP (80) from Anywhere         │
   │   - HTTPS (443) from Anywhere       │
   │   - Custom (3000) from Anywhere     │
   └─────────────────────────────────────┘

FASE 2: CONECTAR AL SERVIDOR
----------------------------
1. Espera que la instancia esté "Running"
2. Selecciona la instancia → Connect
3. En Windows (cmd):
   ```
   ssh -i "tu-key.pem" ubuntu@tu-ip-publica
   ```

FASE 3: INSTALAR DEPENDENCIAS
-----------------------------
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 (para mantener app corriendo)
sudo npm install -g pm2

# Instalar git
sudo apt install git -y

# Verificar instalaciones
node --version
npm --version
git --version
```

FASE 4: SUBIR TU CÓDIGO
----------------------
```bash
# Clonar tu repositorio (primero súbelo a GitHub)
git clone https://github.com/tu-usuario/whatsapp-trigger.git
cd whatsapp-trigger

# Instalar dependencias
npm install

# Crear archivo .env
nano .env
```

Contenido del .env:
```
PORT=3000
HOST=0.0.0.0
WEBHOOK_URL=https://n8n-kubectl.42web.io/webhook/whatsapp-bot
DEBUG=true
```

FASE 5: CONFIGURAR PM2
---------------------
```bash
# Crear archivo de configuración PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js

# Ver logs
pm2 logs

# Configurar PM2 para auto-inicio
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

FASE 6: CONFIGURAR NGINX (OPCIONAL PERO RECOMENDADO)
---------------------------------------------------
```bash
# Instalar nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/whatsapp-bot
```

Contenido del archivo nginx:
```nginx
server {
    listen 80;
    server_name tu-ip-publica;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

FASE 7: CONFIGURAR SSL CON CERTBOT (HTTPS)
------------------------------------------
```bash
# Instalar certbot
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Auto-renovación
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

FASE 8: CONFIGURAR DOMINIO (OPCIONAL)
------------------------------------
1. Compra dominio en Namecheap/GoDaddy
2. En DNS, agrega registro A:
   - Name: @ (o www)
   - Value: Tu IP pública de EC2
3. Espera propagación DNS (5-60 minutos)

FASE 9: PRUEBA FINAL
-------------------
```bash
# Ver status
pm2 status
sudo systemctl status nginx

# Ver logs
pm2 logs whatsapp-bot
sudo tail -f /var/log/nginx/error.log

# Probar endpoints
curl http://tu-ip-o-dominio/status
```

🔧 COMANDOS ÚTILES DE MANTENIMIENTO:
===================================
```bash
# Restart app
pm2 restart whatsapp-bot

# Ver logs en tiempo real  
pm2 logs whatsapp-bot --lines 50

# Actualizar código
git pull origin main
npm install
pm2 restart whatsapp-bot

# Monitorear recursos
pm2 monit
htop
```

💰 COSTOS ESTIMADOS:
===================
- Primer año: GRATIS (750 horas/mes)
- Después del año: ~$8-15 USD/mes
- Con dominio: +$10-15 USD/año
- Total real: ~$10-20 USD/mes después del primer año

⏰ TIEMPO TOTAL ESTIMADO:
========================
- Setup inicial: 1-2 horas
- Configuración SSL/dominio: +30 minutos  
- Total: 1.5-2.5 horas

🎯 RESULTADO FINAL:
==================
- URL: https://tu-dominio.com o http://tu-ip-publica
- Endpoints:
  - GET /status
  - POST /send-message
- Tu webhook de n8n funcionará perfectamente
- App corriendo 24/7 con auto-restart

⚖️  VEREDICTO:
==============
EC2 es EXCELENTE si:
✅ Tienes tiempo para configurar
✅ Quieres aprender DevOps  
✅ Necesitas control total
✅ Tu app crecerá significativamente

Pero Railway/Render son MEJORES si:
✅ Quieres funcionar en 2-10 minutos
✅ Prefieres simplicidad
✅ Solo necesitas webhook básico
✅ No quieres mantener servidor

🤔 MI RECOMENDACIÓN:
===================
1. Empieza con Railway/Render (funciona YA)
2. Si tu app crece, migra a EC2 después
3. Mejor tener algo funcionando hoy que algo perfecto en 2 horas
