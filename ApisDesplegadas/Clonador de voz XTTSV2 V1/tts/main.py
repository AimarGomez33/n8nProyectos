import torch
import gradio as gr
import os
import time

# --- Añadir las clases necesarias para la deserialización segura ---
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import XttsAudioConfig, XttsArgs
from TTS.config.shared_configs import BaseDatasetConfig

# Esto es necesario desde PyTorch 2.6+ por motivos de seguridad
torch.serialization.add_safe_globals([XttsConfig, XttsAudioConfig, BaseDatasetConfig, XttsArgs])

from TTS.api import TTS

# --- Configuración inicial ---
device = "cpu"
print(f"Usando dispositivo: {device}")
model_name = "tts_models/multilingual/multi-dataset/xtts_v2"

# Crear el directorio de salida si no existe
output_dir = os.path.join(os.getcwd(), "outputs")
os.makedirs(output_dir, exist_ok=True)

# --- Cargar el modelo una sola vez al inicio ---
print("Cargando el modelo TTS. Esto puede tardar un momento...")
# La advertencia sobre GPT2InferenceModel es normal, puedes ignorarla.
# Aceptar automáticamente los términos de servicio para Docker
import os
os.environ['COQUI_TOS_AGREED'] = '1'
tts = TTS(model_name=model_name, progress_bar=True, gpu=False)
print(" Modelo TTS cargado exitosamente usando CPU.")


def generate_audio(text, speaker_wav):
    if not text or not speaker_wav:
        print("Advertencia: Se requiere texto y un archivo de audio de referencia.")
        return None

    unique_audio_path = os.path.join(output_dir, f"output_{int(time.time())}.wav")
    
    print(f"Generando audio para el texto: '{text}'")
    
    tts.tts_to_file(
        text=text,
        file_path=unique_audio_path,
        speaker_wav=speaker_wav,
        language="es"
    )
    
    print(f"Audio generado y guardado en: {unique_audio_path}")
    return unique_audio_path

demo = gr.Interface(
    fn=generate_audio,
    inputs=[
        gr.Textbox(label="Texto a Sintetizar"),
        gr.Audio(sources=["upload"], type="filepath", label="Audio de Referencia para Clonar Voz (WAV)")
    ],
    outputs=gr.Audio(type="filepath", label="Audio Generado con Voz Clonada"),
    title = """Prueba de clonación de voce con X-TTS y el modelo de ia Spark TTS""",
    description="Sube un archivo de audio corto (WAV) con la voz a clonar e introduce el texto.",
    allow_flagging="never"
)


if __name__ == "__main__":
    # Configuración para Docker: permitir conexiones desde cualquier IP
    demo.queue().launch(
        server_name="0.0.0.0",  # Permitir conexiones externas
        server_port=7860,       # Puerto específico
        share=False             # No usar tunnel público en Docker
    )