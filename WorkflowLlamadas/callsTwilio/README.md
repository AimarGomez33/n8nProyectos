# Aplicación de Llamadas con Twilio

Esta es una aplicación simple creada en Node.js y Express que utiliza la API de Twilio para realizar llamadas telefónicas salientes y gestionar la respuesta de voz.

## Características

- Inicia una llamada telefónica a un número específico.
- Utiliza TwiML para dictar un mensaje de voz cuando la llamada es contestada.
- Configuración sencilla a través de variables de entorno.

## Prerrequisitos



- [Node.js](https://nodejs.org/) instalado (versión 12 o superior).
- Una cuenta de [Twilio](https://www.twilio.com/try-twilio) con un número de teléfono activo.
- `ngrok` o una herramienta similar para exponer tu servidor local a internet.



## Configuración

1.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables con tus credenciales de Twilio:

    ```
    TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    TWILIO_AUTH_TOKEN=your_auth_token
    TWILIO_PHONE=+15017122661
    PORT=3000
    ```

    - `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN`: Los encuentras en el [dashboard de tu cuenta de Twilio](https://www.twilio.com/console).
    - `TWILIO_PHONE`: Tu número de teléfono de Twilio.
    - `PORT`: El puerto en el que se ejecutará el servidor (por defecto 3000).

2.  **Exponer el servidor local:**
    Twilio necesita acceder a tu endpoint `/voice` desde internet. Usa `ngrok` para crear un túnel seguro a tu servidor local.

    ```bash
    ngrok http 3000
    ```

    Ngrok te dará una URL pública (ej. `https://xxxx-xx-xx-xx.ngrok-free.app`).

3.  **Actualizar la URL en el código:**
    En el archivo `app.js`, reemplaza la URL de `ngrok` en el endpoint `/call` con la que obtuviste en el paso anterior.

    ```javascript
    // app.js

    const call = await client.calls.create({
      url: 'https://TU_URL_DE_NGROK/voice', // <-- Actualiza esta línea
      to: '+527711270119',
      from: process.env.TWILIO_PHONE
    });
    ```

## Uso

1.  **Iniciar el servidor:**

    ```bash
    node app.js
    ```

    Verás un mensaje en la consola indicando que el servidor está en línea: `Servidor en http://localhost:3000`.

2.  **Realizar una llamada:**
    Abre tu navegador o una herramienta como Postman y haz una petición GET a la siguiente URL para iniciar la llamada:

    ```
    http://localhost:3000/call
    ```

    La aplicación se conectará a Twilio, y Twilio llamará al número de teléfono especificado en el código. Cuando la persona conteste, escuchará el mensaje definido en el endpoint `/voice`.

## Explicación del Código (`app.js`)

-   **Inicialización:**
    -   Se cargan las variables de entorno con `dotenv`.
    -   Se inicializa `express` y el cliente de `twilio`.

-   **Endpoint `POST /voice`:**
    -   Este endpoint es el *webhook* que Twilio consume cuando la llamada es contestada.
    -   Crea una respuesta TwiML (`VoiceResponse`).
    -   `vr.say()`: Genera la instrucción para que Twilio lea un texto en voz alta. Se especifica el idioma y la voz.
    -   `vr.hangup()`: Termina la llamada.
    -   La respuesta se envía a Twilio en formato XML.

-   **Endpoint `GET /call`:**
    -   Este endpoint inicia la llamada saliente.
    -   `client.calls.create()`: Es el método del SDK de Twilio que crea la llamada.
        -   `url`: La URL pública (de ngrok) a la que Twilio hará una petición POST cuando la llamada se conteste. Esta URL debe apuntar al endpoint `/voice`.
        -   `to`: El número de teléfono de destino.
        -   `from`: Tu número de teléfono de Twilio.
    -   Si la llamada se inicia correctamente, devuelve el SID de la llamada.

-   **Inicio del Servidor:**
    -   `app.listen()`: Inicia el servidor Express en el puerto especificado (3000 por defecto).
