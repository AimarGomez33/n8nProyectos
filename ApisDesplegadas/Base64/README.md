# API de Codificación/Decodificación de Audio en Base64

Esta es una API simple para codificar y decodificar archivos de audio hacia y desde Base64.

## Instalación

1. Clona el repositorio.
2. Crea un entorno virtual.
3. Instala las dependencias:

```bash    
pip install -r requirements.txt
```

## Uso  

Ejecuta la API con el siguiente comando:

```bash
uvicorn main:app --reload
```

También puedes ejecutar el archivo ```main.py``` directamente:

```bash
python main.py
```

La API estará disponible en `http://localhost:8000`.

## Endpoints

* `POST /encode-audio`: Codifica un archivo de audio a Base64.
* `POST /decode-audio`: Decodifica una cadena Base64 en un archivo de audio.
* `GET /`: Devuelve un mensaje de bienvenida.