@echo off
echo.
echo 🚀 GUÍA PARA INICIAR EL SERVIDOR WHATSAPP
echo ========================================
echo.

cd /d "c:\Users\jair_\Desktop\trigger"

echo 📋 MÉTODOS DISPONIBLES:
echo.
echo 1. start.bat          (🌟 RECOMENDADO)
echo 2. npm start          (Comando directo)
echo 3. node src/index.js  (Comando básico)
echo.

echo ========================================
echo 🎯 PROCESO COMPLETO DE INICIO:
echo ========================================
echo.
echo Paso 1: Abrir terminal en el proyecto
echo   cd "c:\Users\jair_\Desktop\trigger"
echo.
echo Paso 2: Iniciar el servidor (elige uno):
echo.
echo   Opción A - Script automático:
echo   start.bat
echo.
echo   Opción B - npm:
echo   npm start
echo.
echo   Opción C - Node directo:
echo   node src/index.js
echo.

echo Paso 3: Esperar a ver estos mensajes:
echo   ✅ "Server running on port 3000"
echo   🔄 "Inicializando WhatsApp Web..."
echo   📱 "QR Code generated" (primera vez)
echo.

echo Paso 4: Conectar WhatsApp
echo   - Ve a http://localhost:3000
echo   - Escanea el QR con tu WhatsApp
echo   - Espera: "✅ WhatsApp Web está listo!"
echo.

echo ========================================
echo 🔍 VERIFICACIONES ANTES DE INICIAR:
echo ========================================
echo.

:: Verificar Node.js
echo 1. Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo 🔧 Instala desde: https://nodejs.org/
    goto :dependencies
) else (
    echo ✅ Node.js instalado
    node --version
)

:dependencies
echo.
echo 2. Verificando dependencias...
if exist "node_modules" (
    echo ✅ Dependencias instaladas
) else (
    echo ❌ Dependencias no instaladas
    echo 🔧 Ejecutando: npm install
    npm install
)

echo.
echo 3. Verificando archivo .env...
if exist ".env" (
    echo ✅ Archivo .env existe
    findstr "PORT" .env
    findstr "WEBHOOK_URL" .env
) else (
    echo ❌ Archivo .env no existe
    echo 🔧 Se creará automáticamente al iniciar
)

echo.
echo ========================================
echo 🧪 ¿QUIERES INICIAR EL SERVIDOR AHORA?
echo ========================================

set /p iniciar="¿Iniciar servidor? (S/N): "

if /i "%iniciar%"=="S" (
    echo.
    echo 🚀 Iniciando servidor con start.bat...
    echo.
    echo ⚠️  IMPORTANTE: 
    echo - Mantén esta ventana abierta
    echo - El servidor estará en http://localhost:3000
    echo - Para detener: Ctrl+C
    echo.
    echo Iniciando en 3 segundos...
    timeout /t 3 >nul
    call start.bat
) else (
    echo.
    echo 💡 Para iniciar manualmente, usa cualquiera de estos comandos:
    echo.
    echo   start.bat
    echo   npm start  
    echo   node src/index.js
    echo.
)

echo.
echo ========================================
echo 📱 DESPUÉS DE INICIAR:
echo ========================================
echo.
echo 1. Abre http://localhost:3000 en tu navegador
echo 2. Si es la primera vez, aparecerá un QR
echo 3. Escanea el QR con WhatsApp Web
echo 4. Espera a ver "✅ WhatsApp conectado"
echo 5. ¡Listo para recibir mensajes!
echo.

pause
