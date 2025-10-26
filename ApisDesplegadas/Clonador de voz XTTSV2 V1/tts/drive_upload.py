from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from auth import authenticate

def upload_file(creds, filename, mimetype='audio/wav'):
    drive_service = build('drive', 'v3', credentials=creds)
    file_metadata = {'name': filename.split("\\")[-1]}  # Solo el nombre del archivo
    media = MediaFileUpload(filename, mimetype=mimetype)
    file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()
    print(f' Archivo subido con ID: {file.get("id")}')
    return file.get('id')

def hacer_publico_y_obtener_url(creds, file_id):
    drive_service = build('drive', 'v3', credentials=creds)

    # Hacer el archivo público
    drive_service.permissions().create(
        fileId=file_id,
        body={"role": "reader", "type": "anyone"},
    ).execute()

    # Crear enlace de descarga
    download_url = f"https://drive.google.com/uc?id={file_id}&export=download"
    print(f" Enlace de descarga directa: {download_url}")
    return download_url

if __name__ == "__main__":
    creds = authenticate()
    ruta_archivo = r"C:\Users\jair_\AppData\Local\Temp\gradio\1f117375f76aece6a842305385de3fbc3ad5e969424677683ced272aaa1f1010\output_1750229126.wav"
    file_id = upload_file(creds, ruta_archivo)
    hacer_publico_y_obtener_url(creds, file_id)
