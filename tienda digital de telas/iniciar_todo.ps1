# ============================================================
# iniciar_todo.ps1 — Script de inicio completo D&D Textil
# Inicia: PostgreSQL (si parado) → Backend Java → Frontend React
# ============================================================

Write-Host "=== D&D Textil - Iniciando plataforma completa ===" -ForegroundColor Cyan

# 1. Verificar y arrancar PostgreSQL
$pgService = Get-Service -Name "postgresql-x64-17" -ErrorAction SilentlyContinue
if ($null -eq $pgService) { $pgService = Get-Service -Name "postgresql-x64-18" -ErrorAction SilentlyContinue }
if ($pgService -and $pgService.Status -ne 'Running') {
    Write-Host "Iniciando servicio PostgreSQL ($($pgService.Name))..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-WindowStyle Hidden -Command `"Start-Service '$($pgService.Name)'`"" -Wait
    Start-Sleep -Seconds 2
}
Write-Host "PostgreSQL: OK" -ForegroundColor Green

# 2. Iniciar el Backend Java en nueva ventana
Write-Host "Iniciando Backend Java (puerto 8081)..." -ForegroundColor Yellow
$backendPath = "C:\Users\Anderson Moreno\Documents\tienda digital de telas\tienda digital de telas\backend-java\conexionPostgres"
Start-Process cmd -ArgumentList "/c title Backend Java D&D Textil & color 0A & echo === BACKEND JAVA === & set DB_PASSWORD=Mp.1025889078& set DB_USER=postgres& set DB_URL=jdbc:postgresql://localhost:5432/tienda_digital_textiles_db& java -cp `"bin;lib/*`" App & pause" -WorkingDirectory $backendPath
Write-Host "Backend lanzado. Esperando arranque..." -ForegroundColor Green
Start-Sleep -Seconds 3

# 3. Iniciar el Frontend React en nueva ventana
Write-Host "Iniciando Frontend React (puerto 5173)..." -ForegroundColor Yellow
$frontendPath = "C:\Users\Anderson Moreno\Documents\tienda digital de telas\tienda digital de telas"
Start-Process cmd -ArgumentList "/c title Frontend React D&D Textil & color 0B & echo === FRONTEND VITE === & npm run dev & pause" -WorkingDirectory $frontendPath

# 4. Abrir navegador
Write-Host "Abriendo http://localhost:5173 en el navegador..." -ForegroundColor Cyan
Start-Sleep -Seconds 4
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "=== Plataforma iniciada correctamente ===" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8081" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales de acceso:" -ForegroundColor Yellow
Write-Host "  Admin:    admin@ddtextil.com    / admin123" -ForegroundColor White
Write-Host "  Vendedor: vendedor@ddtextil.com / vendedor123" -ForegroundColor White
Write-Host "  Cliente:  cliente@ddtextil.com  / cliente123" -ForegroundColor White
