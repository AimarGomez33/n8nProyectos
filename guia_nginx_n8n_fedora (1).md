# Guía (Fedora) — Nginx como proxy inverso para n8n + HTTPS con Certbot

> Esta guía te deja n8n corriendo en **Fedora** detrás de **Nginx** con **HTTPS** de Let’s Encrypt. Incluye dos caminos:
> - **A)** n8n en **Docker** (recomendado, más simple de mantener).
> - **B)** n8n **nativo** con `systemd`.

---

## 0) Requisitos previos

- Un servidor con **Fedora** (38/39/40+).
- Un dominio apuntando a tu servidor (registra un **A**/`AAAA` hacia tu IP pública), por ejemplo:  
  `n8n.tudominio.com`
- Puertos abiertos: **80/tcp** y **443/tcp** (HTTP/HTTPS).
- Usuario con privilegios de `sudo`.

---

## 1) Paquetes base, firewall y SELinux

```bash
sudo dnf -y upgrade
sudo dnf -y install nginx certbot python3-certbot-nginx
sudo systemctl enable --now nginx
sudo firewall-cmd --add-service=http --permanent
sudo firewall-cmd --add-service=https --permanent
sudo firewall-cmd --reload
sudo setsebool -P httpd_can_network_connect on
```

> **Nota SELinux (puerto upstream):**
```bash
sudo dnf -y install policycoreutils-python-utils
sudo semanage port -a -t http_port_t -p tcp 5678
```

---

## 2) Opción A (Docker + Compose)

### 2.1 Instalar Docker y Compose
```bash
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf -y install docker-ce docker-ce-cli containerd.io
sudo systemctl enable --now docker
docker compose version
```

### 2.2 Archivo docker-compose.yml
```bash
mkdir -p ~/n8n/{data,compose}
cd ~/n8n/compose

cat > docker-compose.yml <<'YAML'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - N8N_HOST=n8n.tudominio.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.tudominio.com/
    volumes:
      - ../data:/home/node/.n8n
YAML

docker compose up -d
```

---

## 3) Opción B (nativo con systemd)

```bash
sudo dnf module -y install nodejs:lts
sudo useradd -r -m -d /var/lib/n8n -s /usr/sbin/nologin n8n
sudo npm i -g n8n

sudo mkdir -p /etc/n8n
sudo tee /etc/n8n/n8n.env >/dev/null <<'ENV'
N8N_HOST=n8n.tudominio.com
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.tudominio.com/
ENV
```

Archivo de servicio `systemd`:
```bash
sudo tee /etc/systemd/system/n8n.service >/dev/null <<'UNIT'
[Unit]
Description=n8n Automation
After=network-online.target
Wants=network-online.target

[Service]
EnvironmentFile=/etc/n8n/n8n.env
User=n8n
Group=n8n
WorkingDirectory=/var/lib/n8n
ExecStart=/usr/bin/env n8n
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now n8n
```

---

## 4) Nginx como proxy inverso

```bash
sudo tee /etc/nginx/conf.d/n8n.conf >/dev/null <<'NGINX'
server {
    listen 80;
    server_name n8n.tudominio.com;

    location /.well-known/acme-challenge/ { root /usr/share/nginx/html; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    server_name n8n.tudominio.com;

    ssl_certificate     /etc/letsencrypt/live/n8n.tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.tudominio.com/privkey.pem;

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
NGINX

sudo nginx -t
sudo systemctl reload nginx
```

---

## 5) Certificados HTTPS con Certbot

### Método automático
```bash
sudo certbot --nginx -d n8n.tudominio.com --agree-tos -m tu-correo@dominio.com --redirect
```

### Verificar renovación automática
```bash
sudo certbot renew --dry-run
```

---

## 6) Variables clave
```
N8N_HOST=n8n.tudominio.com
N8N_PROTOCOL=https
N8N_PORT=5678
WEBHOOK_URL=https://n8n.tudominio.com/
```

---

## 7) Comprobación final
Abrir en el navegador:  
`https://n8n.tudominio.com`  
Debe mostrar la interfaz de n8n con HTTPS activo.
