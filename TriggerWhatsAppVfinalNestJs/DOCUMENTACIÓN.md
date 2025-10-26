# Documentación del Proyecto: nest-whatsapp-n8n

## 1. Introducción

El proyecto está construido sobre el framework de Node.js, NestJS, y su propósito principal es actuar como un puente  entre WhatsApp y una instancia de n8n.

La aplicación inicializa un cliente de WhatsApp Web, muestra un QR en terminal, una vez escaneado el QR reenvía los mensajes recibidos a un webhook de n8n preconfigurado, permitiendo así la automatización de respuestas.
## 2. Características Principales

- **Integración con WhatsApp:** Utiliza la librería `whatsapp-web.js` para conectarse a WhatsApp y escuchar eventos como la recepción de mensajes.
- **Autenticación por QR:** Genera un código QR para la autenticación de la sesión de WhatsApp. Este QR puede ser visualizado en la terminal o a través de un endpoint específico en una interfaz web simple.
- **Reenvío a Webhook:** Cada mensaje recibido es procesado y enviado mediante una petición HTTP POST a un webhook de n8n, facilitando la integración con flujos de trabajo automatizados.
- **Endpoints de Estado y QR:** Expone una API REST con endpoints para verificar el estado del servicio (`health check`) y para obtener el código QR de autenticación.
- **Configuración:** Emplea variables de entorno para configurar parámetros como el puerto de la aplicación y la URL del webhook de n8n.
- **Contenerización:** Incluye un `Dockerfile` para facilitar el despliegue de la aplicación en entornos de contenedores.

## 3. Estructura del Proyecto

El proyecto sigue la arquitectura modular estándar de NestJS. A continuación, se describen los directorios y archivos más relevantes:

- `src/`: Directorio raíz del código fuente de la aplicación.
  - `main.ts`: Punto de entrada de la aplicación. Se encarga de instanciar la aplicación NestJS, aplicar middlewares (como el límite de tamaño del cuerpo de la petición), configurar pipes de validación y poner en marcha el servidor.
  - `modules/`: Contiene los módulos de la aplicación.
    - `app.module.ts`: Módulo raíz que importa y orquesta los demás módulos y controladores principales.
    - `whatsapp/whatsapp.module.ts`: Módulo dedicado a encapsular toda la lógica relacionada con la interacción con WhatsApp.
  - `presentation/`: Contiene los controladores encargados de exponer la API.
    - `qr.controller.ts`: Define los endpoints `/health`, `/qr` y `/ui/qr` para la gestión del estado y la visualización del código QR.
- `package.json`: Define los metadatos del proyecto, scripts (para iniciar, construir y desarrollar) y las dependencias de producción y desarrollo.
- `nest-cli.json`: Archivo de configuración para la CLI de NestJS.
- `Dockerfile`: Define los pasos para construir una imagen de Docker de la aplicación.
- `.env`: (No incluido en el repositorio) Archivo para definir las variables de entorno.

## 4. Instalación y Ejecución

Para poner en marcha el proyecto en un entorno de desarrollo 

1.  **Instalar Dependencias:**
    Asegúrese de tener Node.js y npm instalados. Ejecute el siguiente comando en la raíz del proyecto:
    ```bash
    npm install
    ```

2.  **Configurar Variables de Entorno:**
    Cree un archivo `.env` en la raíz del proyecto y defina las siguientes variables:
    ```
    # Puerto en el que se ejecutará la aplicación
    PORT=3000

    # URL del webhook de n8n que recibirá los mensajes
    N8N_WEBHOOK_URL=https://az-n8n444.duckdns.org/webhook/whatsapp
    ```

3.  **Ejecutar la Aplicación:**
    Para iniciar la aplicación en modo de desarrollo con recarga automática:
    ```bash
    npm run start:dev
    ```
    Al iniciar, la aplicación generará un código QR en la consola. Escanee este código con la aplicación de WhatsApp en su teléfono (en la sección de Dispositivos Vinculados) para autenticar la sesión.

## 5. Endpoints de la API

La aplicación expone los siguientes endpoints HTTP:

- `GET /`:
  - **Descripción:** Endpoint raíz que devuelve un saludo simple.
  - **Respuesta Exitosa (200):** `Hello World!`

- `GET /health`:
  - **Descripción:** Endpoint de "health check" para verificar que el servicio está activo y configurado correctamente.
  - **Respuesta Exitosa (200):**
    ```json
    {
      "ok": true,
      "url": "https://az-n8n444.duckdns.org/webhook/whatsapp"
    }
    ```

- `GET /qr`:
  - **Descripción:** Devuelve el último código QR generado como una cadena de texto (data URL).
  - **Respuesta Exitosa (200):**
    ```json
    {
      "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
    }
    ```
    

- `GET /ui/qr`:
  - **Descripción:** Renderiza una página HTML simple que muestra el código QR para ser escaneado fácilmente desde un navegador.
  - **Respuesta Exitosa (200):** Una página HTML con el código QR incrustado.

- `POST /send`:
  - **Descripción:** Envía un mensaje de texto o multimedia a un destinatario.
  - **Cuerpo de la Petición (para texto):**
    ```json
    {
      "to": "NUMERO_DESTINO@c.us",
      "type": "text",
      "text": "Contenido del mensaje"
    }
    ```
  - **Cuerpo de la Petición (para multimedia):**
    ```json
    {
      "to": "NUMERO_DESTINO@c.us",
      "type": "image" | "audio",
      "media": {
        "mimetype": "image/png",
        "base64": "BASE64_DEL_ARCHIVO",
        "filename": "nombre-archivo.png",
        "caption": "Pie de foto (opcional)"
      }
    }
    ```
  - **Respuesta Exitosa (200):**
    ```json
    {
      "ok": true,
      "id": "ID_DEL_MENSAJE"
    }
    ```

### Endpoints de Simulación

Estos endpoints se utilizan para fines de desarrollo y pruebas, permitiendo simular la recepción de mensajes en el sistema.

- `POST /simulate-message/text`:
  - **Descripción:** Simula la recepción de un mensaje de texto.
  - **Cuerpo de la Petición:**
    ```json
    {
      "from": "NUMERO_REMITENTE@c.us",
      "text": "Mensaje de prueba"
    }
    ```

- `POST /simulate-message/audio`:
  - **Descripción:** Simula la recepción de un mensaje de audio.
  - **Cuerpo de la Petición:**
    ```json
    {
      "from": "NUMERO_REMITENTE@c.us",
      "audioUrl": "URL_DEL_AUDIO"
    }
    ```

- `POST /simulate-message/image`:
  - **Descripción:** Simula la recepción de un mensaje de imagen.
  - **Cuerpo de la Petición:**
    ```json
    {
      "from": "NUMERO_REMITENTE@c.us",
      "imageUrl": "URL_DE_LA_IMAGEN"
    }
    ```

## 6. Módulos Principales

### AppModule (`src/modules/app.module.ts`)
Es el módulo principal de la aplicación. Se encarga de:
- Importar `ConfigModule` para la gestión de variables de entorno a nivel global.
- Importar el `WhatsAppModule`, que contiene la lógica central de la aplicación.
- Registrar el `HealthController` para exponer los endpoints de la API.

### WhatsAppModule (`src/modules/whatsapp/whatsapp.module.ts`)
Este módulo es el núcleo de la funcionalidad. Sus responsabilidades incluyen:
- Inicializar el cliente de `whatsapp-web.js`.
- Gestionar el ciclo de vida de la sesión de WhatsApp.
- Generar el código QR para la autenticación y compartirlo con el controlador.
- Escuchar los nuevos mensajes y reenviarlos al webhook de n8n configurado.

## 7. Dependencias Clave

A continuación se listan las dependencias más importantes del proyecto:

- **@nestjs/core:** El núcleo del framework NestJS, que proporciona la arquitectura modular y el sistema de inyección de dependencias.
- **whatsapp-web.js:** Librería que permite interactuar con WhatsApp Web, automatizando la comunicación.
- **qrcode-terminal:** Utilidad para generar y mostrar códigos QR en la terminal.
- **axios:** Cliente HTTP utilizado para realizar las peticiones POST al webhook de n8n.
- **dotenv:** Módulo para cargar variables de entorno desde un archivo `.env`.
- **puppeteer:** Navegador headless controlado mediante código, requerido por `whatsapp-web.js` para funcionar.
