@echo off
echo ==========================================
echo    INICIANDO TIENDA DIGITAL DE TELAS
echo ==========================================
echo.
echo 1. Abriendo navegador...
start "" "http://localhost:5173"
echo.
echo 2. Iniciando servidor de desarrollo...
echo    (No cierres esta ventana mientras uses la tienda)
echo.
cd /d "%~dp0"
npm run dev
pause
