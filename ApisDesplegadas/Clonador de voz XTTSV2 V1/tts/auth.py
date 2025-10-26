from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import os

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def authenticate():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Puerto fijo 64010 para el servidor local
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=64010)

        # Guardar token para futuras ejecuciones
        with open('token.json', 'w') as token_file:
            token_file.write(creds.to_json())

    return creds

if __name__ == "__main__":
    creds = authenticate()
    print("Autenticación exitosa.")
