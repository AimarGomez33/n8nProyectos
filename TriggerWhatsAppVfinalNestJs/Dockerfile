FROM node:20-slim

RUN apt-get update && apt-get install -y           ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0           libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libglib2.0-0           libnss3 libx11-6 libx11-xcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2           xdg-utils libgbm1 libxkbcommon0 libpango-1.0-0 libxshmfence1 libxrender1 libdrm2           && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm i --omit=dev
COPY . .
RUN npm run build

ENV N8N_WEBHOOK_URL=https://az-n8n444.duckdns.org/webhook/whatsapp
ENV PUPPETEER_NO_SANDBOX=true
EXPOSE 3001
CMD ["npm", "run", "start"]
