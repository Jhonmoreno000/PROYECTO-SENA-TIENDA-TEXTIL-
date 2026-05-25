@echo off
chcp 65001 >nul
echo === D^&D Textil - Iniciando plataforma completa (Windows) ===

echo.
echo 1. Verificando PostgreSQL...
echo (Asegúrate de que el servicio de PostgreSQL esté iniciado en tu sistema)
echo.

:: %~dp0 obtiene la ruta de la carpeta donde está este script (incluye \ al final)
set "BASE_DIR=%~dp0tienda digital de telas"

echo 2. Iniciando Backend Java (puerto 8081)...
set DB_PASSWORD=Mp.1025889078
set DB_USER=postgres
set DB_URL=jdbc:postgresql://localhost:5432/tienda_digital_textiles_db

cd /d "%BASE_DIR%\backend-java\conexionPostgres"
:: En Windows el separador de classpath es ";" en lugar de ":"
start "D&D Textil - Backend Java" cmd /k "java -cp "bin;lib/*" App"
echo Backend lanzado en una nueva ventana.

:: Esperar 3 segundos
timeout /t 3 /nobreak >nul

echo.
echo 3. Iniciando Frontend React (puerto 5173)...
cd /d "%BASE_DIR%"
start "D&D Textil - Frontend React" cmd /k "npm run dev"
echo Frontend lanzado en una nueva ventana.

:: Esperar 4 segundos
timeout /t 4 /nobreak >nul

echo.
echo 4. Abriendo http://localhost:5173 en el navegador...
start http://localhost:5173

echo.
echo === Plataforma iniciada correctamente ===
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8081
echo.
echo Credenciales de acceso:
echo   Admin:    admin@ddtextil.com    / admin123
echo   Vendedor: vendedor@ddtextil.com / vendedor123
echo   Cliente:  cliente@ddtextil.com  / cliente123
echo.
echo Para detener los servicios cuando termines, simplemente cierra
echo las ventanas de comandos que se abrieron para el Backend y el Frontend.
echo.
pause
