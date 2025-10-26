# Documentación de la API: Conversor de WAV a OGG

## Introducción

Este documento proporciona información detallada sobre la **API del Conversor de WAV a OGG**. Esta API está diseñada para ser utilizada en un flujo de trabajo de n8n para convertir mensajes de voz del formato WAV a un formato OGG compatible con WhatsApp.

La API está construida con **FastAPI**, un marco de trabajo web moderno y rápido (de alto rendimiento) para construir APIs con Python.

## Resumen de la API

*   **Título:** Conversor de WAV a OGG
*   **Descripción:** Una API para convertir archivos de audio WAV al formato OGG.


## Endpoints

### 1. Convertir WAV a OGG

Este endpoint convierte un archivo de audio WAV al formato OGG.

*   **URL:** `/convert-ogg`
*   **Método:** `POST`
*   **Solicitud:**
    *   **Cuerpo:** El cuerpo de la solicitud debe ser una solicitud `multipart/form-data` que contenga el archivo WAV a convertir.
    *   **Archivo:** El archivo debe enviarse con la clave `file`.

*   **Respuesta Exitosa:**
    *   **Código de Estado:** `200 OK`
    *   **Content-Type:** `audio/ogg`
    *   **Cuerpo:** El cuerpo de la respuesta contendrá el archivo de audio OGG convertido. El archivo se enviará como un adjunto con el nombre de archivo original, pero con la extensión `.ogg`.

*   **Respuestas de Error:**
    *   **Código de Estado:** `400 Bad Request`
        *   **Razón:** Este error ocurre si el archivo subido no es un archivo `.wav`.
        *   **Cuerpo de la Respuesta:**
            ```json
            {
              "detail": "Solo se admiten archivos WAV"
            }
            ```
    *   **Código de Estado:** `500 Internal Server Error`
        *   **Razón:** Este error ocurre si hay un problema durante el proceso de conversión del archivo.
        *   **Cuerpo de la Respuesta:**
            ```json
            {
              "detail": "Error al convertir el archivo: {mensaje_de_error}"
            }
            ```

### 2. Raíz

Este es el endpoint raíz para verificar if la API está en funcionamiento.

*   **URL:** `/`
*   **Método:** `GET`
*   **Respuesta Exitosa:**
    *   **Código de Estado:** `200 OK`
    *   **Content-Type:** `application/json`
    *   **Cuerpo de la Respuesta:**
        ```json
        {
          "message": "API del Conversor de WAV a OGG",
          "status": "activa",
          "version": "1.0.0",
          "docs": "http://localhost:8000/docs",
          "redoc": "http://localhost:8000/redoc"
        }
        ```

### 3. Verificación de Estado (Health Check)

Este endpoint se puede utilizar para monitorear el estado de la API.

*   **URL:** `/health`
*   **Método:** `GET`
*   **Respuesta Exitosa:**
    *   **Código de Estado:** `200 OK`
    *   **Content-Type:** `application/json`
    *   **Cuerpo de la Respuesta:**
        ```json
        {
          "status": "saludable"
        }
        ```

## Cómo Ejecutar la API

Para ejecutar la API, necesitas tener Python y `uvicorn` instalados. Puedes ejecutar la API con el siguiente comando en tu terminal:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Esto iniciará la API en `http://localhost:8000`.

## Dependencias

Las siguientes bibliotecas de Python son necesarias para que la API funcione correctamente:

*   `fastapi`
*   `uvicorn`
*   `pydub`
*   `python-multipart`

Puedes instalar estas dependencias usando `pip`:

```bash
pip install fastapi uvicorn pydub python-multipart
```