from gradio_client import Client, handle_file
import os

client = Client("http://127.0.0.1:7860/")

audio_path = r"C:\Users\jair_\Desktop\Xttsai\Speakers\WhatsApp-Ptt-2025-03-21-at-11.09.07-PM.wav"  # Usa una ruta válida

if not os.path.exists(audio_path):
    raise FileNotFoundError(f"El archivo no existe: {audio_path}")

audio_file = handle_file(audio_path)

result = client.predict(
    text="hola",
    speaker_wav=audio_file,
    api_name="/predict"
)

print(result)
