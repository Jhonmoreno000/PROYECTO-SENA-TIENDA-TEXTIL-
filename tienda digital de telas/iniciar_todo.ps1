$svc = Get-Service *postgres* | Where-Object Status -eq 'Stopped'
if ($svc) {
    Write-Host "Iniciando servicio de base de datos PostgreSQL..."
    Start-Process powershell -Verb RunAs -ArgumentList "-WindowStyle Hidden -Command `"Get-Service *postgres* | Where-Object Status -eq 'Stopped' | Start-Service`"" -Wait
}

Write-Host "Iniciando servidor Backend de Java (Se abrira en otra ventana)..."
Start-Process cmd -ArgumentList "/c title Backend Java & cd `"C:\Users\Anderson Moreno\Documents\tienda digital de telas\tienda digital de telas\backend-java\conexionPostgres`" & color 0a & echo === BACKEND JAVA === & set DB_PASSWORD=Mp.1025889078& java -cp `"bin;lib/*`" App & pause"

Write-Host "Iniciando servidor Frontend de React (Se abrira en otra ventana)..."
Start-Process cmd -ArgumentList "/c title Frontend React & cd `"C:\Users\Anderson Moreno\Documents\tienda digital de telas\tienda digital de telas`" & color 0b & echo === FRONTEND VITE === & npm run dev & pause"

Write-Host "Abriendo http://localhost:3001 en tu navegador..."
Start-Sleep -Seconds 3
Start-Process "http://localhost:3001"
