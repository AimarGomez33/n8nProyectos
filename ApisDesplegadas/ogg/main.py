from pydub import AudioSegment
import os
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
import uvicorn


app = FastAPI(
    title="Convertidor de WAV a OGG",
    description="API para convertir archivos de audio WAV a formato OGG",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc"  # ReDoc
)

@app.post("/convert-ogg")
async def convert_wav_to_ogg(file: UploadFile = File(...)):
    """
    Converts a WAV file to OGG format via API endpoint.

    Args:
        file (UploadFile): The uploaded WAV file to convert.

    Returns:
        FileResponse: The converted OGG file for download.
    """
    try:
        # Validate file and filename
        if not file.filename or not file.filename.lower().endswith('.wav'):
            raise HTTPException(status_code=400, detail="Only WAV files are supported")

        # Create temporary paths
        input_wav_path = f"temp_{file.filename}"
        output_ogg_path = f"temp_{file.filename.replace('.wav', '.ogg')}"

        # Save uploaded file temporarily
        with open(input_wav_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_ogg_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Convert audio
        audio = AudioSegment.from_wav(input_wav_path)
        audio.export(output_ogg_path, format="ogg")
        print(f"Successfully converted '{input_wav_path}' to '{output_ogg_path}'")

        # Clean up input file
        os.remove(input_wav_path)

        # Return the converted file
        return FileResponse(
            path=output_ogg_path,
            media_type="audio/ogg",
            filename=file.filename.replace('.wav', '.ogg'),
            headers={"Content-Disposition": f"attachment; filename={file.filename.replace('.wav', '.ogg')}"}
        )

    except Exception as e:
        # Clean up files if they exist
        input_wav_path = locals().get('input_wav_path')
        output_ogg_path = locals().get('output_ogg_path')

        for temp_file in [input_wav_path, output_ogg_path]:
            if temp_file and os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except:
                    pass

        raise HTTPException(status_code=500, detail=f"Error converting file: {str(e)}")

@app.get("/")
async def root():
    """
    Root endpoint to check if the API is running.
    """
    return {
        "message": "Convertidor de WAV a OGG API",
        "status": "active",
        "version": "1.0.0",
        "docs": "http://localhost:8000/docs",
        "redoc": "http://localhost:8000/redoc"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}