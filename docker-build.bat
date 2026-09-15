@echo off
chcp 65001 > nul
echo =================================================================
echo   D^&D Textil - Construcción y Despliegue de Imágenes Docker
echo =================================================================
echo.

echo 1. Construyendo imagen Docker del Backend (Java + PostgreSQL JDBC)...
docker build -t ddtextil-backend "./tienda digital de telas/backend-java/conexionPostgres"
if %errorlevel% neq 0 (
    echo [ERROR] Falló la construcción de la imagen del backend.
    pause
    exit /b %errorlevel%
)
echo -> Backend construido exitosamente.
echo.

echo 2. Construyendo imagen Docker del Frontend (React + Vite + Nginx)...
docker build -t ddtextil-frontend "./tienda digital de telas"
if %errorlevel% neq 0 (
    echo [ERROR] Falló la construcción de la imagen del frontend.
    pause
    exit /b %errorlevel%
)
echo -> Frontend construido exitosamente.
echo.

echo 3. Levantando servicios con Docker Compose...
docker compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Falló el inicio de los servicios con docker compose.
    pause
    exit /b %errorlevel%
)

echo.
echo =================================================================
echo   ¡Despliegue completado con éxito!
echo =================================================================
echo   - Frontend: http://localhost:3001
echo   - Backend:  http://localhost:8081
echo   - Base DB:  PostgreSQL en puerto 5432
echo =================================================================
pause
