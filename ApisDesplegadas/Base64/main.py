from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.background import BackgroundTasks
from pydantic import BaseModel
import base64
import os
import tempfile
import uvicorn
import mimetypes

app = FastAPI(
    title="Generic Base64 Encoder/Decoder API",
    version="2.0.0",
    description="API para codificar y decodificar cualquier archivo usando Base64"
)

class FileBase64Request(BaseModel):
    base64_data: str          # contenido codificado en Base64
    filename: str = "output"  # nombre sugerido para el archivo resultante

@app.get("/")
async def root():
    return {
        "message": "API para codificar y decodificar archivos en Base64",
        "version": "2.0.0",
        "endpoints": {
            "POST /encode-file": "Sube cualquier archivo y lo devuelve en Base64",
            "POST /decode-file": "Manda Base64 y nombre, y recibes el archivo reconstruido"
        }
    }

@app.post("/encode-file")
async def encode_file(file: UploadFile = File(...)):
    """
    Codifica un archivo cualquiera (pdf, png, zip, mp3, lo que sea) a Base64
    """
    try:
        # Leemos el archivo completo
        file_bytes = await file.read()

        # Convertimos a Base64
        base64_str = base64.b64encode(file_bytes).decode('utf-8')

        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size_bytes": len(file_bytes),
            "base64_data": base64_str
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error codificando archivo: {str(e)}"
        )

@app.post("/decode-file")
async def decode_file(request: FileBase64Request, background_tasks: BackgroundTasks = None):
    """
    Decodifica un string Base64 y regresa el archivo original para descarga.
    Guarda temporalmente el archivo en disco y luego lo elimina.
    """
    try:
        # Decodificar el Base64 a bytes crudos
        try:
            file_bytes = base64.b64decode(request.base64_data)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Base64 inválido: {str(e)}"
            )

        # Sacar extensión si el usuario la incluyó
        _, ext = os.path.splitext(request.filename)
        if not ext:
            # si no mandó extensión, no forzamos una
            ext = ""

        # Crear archivo temporal persistente
        temp_file = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=ext
        )
        temp_file.write(file_bytes)
        temp_file.flush()
        temp_file.close()
        temp_filename = temp_file.name

        # Deducir tipo MIME para la respuesta
        media_type, _ = mimetypes.guess_type(request.filename)
        if not media_type:
            media_type = "application/octet-stream"

        # Programar limpieza del archivo temporal al terminar la respuesta
        def cleanup(path: str):
            if os.path.exists(path):
                os.remove(path)

        if background_tasks is not None:
            background_tasks.add_task(cleanup, temp_filename)

        return FileResponse(
            path=temp_filename,
            filename=request.filename,
            media_type=media_type,
        )

    except HTTPException:
        # volvemos a lanzar tal cual
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error decodificando Base64: {str(e)}"
        )
