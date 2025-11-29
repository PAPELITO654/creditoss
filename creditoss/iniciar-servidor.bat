@echo off
TITLE Creditos Express - Servidor Publico
COLOR 0A

echo ========================================================
echo      CRÉDITOS EXPRESS - INICIANDO SERVIDOR PÚBLICO
echo ========================================================
echo.

:: 1. Verificar si ngrok está instalado
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] ngrok no encontrado.
    echo Por favor descarga ngrok de: https://ngrok.com/download
    echo y colocalo en esta carpeta o en tu PATH.
    echo.
    pause
    exit
)

:: 2. Configurar AuthToken (Detectado de tu captura)
echo Configurando ngrok...
ngrok config add-authtoken 365zH3BcWCEK0Tz7S3A7uymMCVd_6bSq3GWhMF9cEwrH9nQDz

:: 3. Instrucciones
echo [INFO] Asegurate de que XAMPP/Apache este corriendo en el puerto 80.
echo.
echo Iniciando tunel seguro...
echo.

:: 4. Iniciar ngrok
echo --------------------------------------------------------
echo  TU PROYECTO ESTARA DISPONIBLE EN LA URL QUE APARECE ABAJO
echo  Busca la linea que dice "Forwarding" (ej. https://xxxx.ngrok-free.app)
echo --------------------------------------------------------
echo.
ngrok http 80

pause
