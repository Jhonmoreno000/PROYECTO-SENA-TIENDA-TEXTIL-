#!/bin/bash

# ============================================================
# iniciar_todo.sh — Script de inicio completo D&D Textil para Linux
# Inicia: Backend Java → Frontend React
# ============================================================

echo -e "\e[36m=== D&D Textil - Iniciando plataforma completa (Linux) ===\e[0m"

# 1. Verificar si PostgreSQL está corriendo
if ! systemctl is-active --quiet postgresql; then
    echo -e "\e[33mPostgreSQL no está corriendo. Iniciando servicio (podría pedir contraseña)...\e[0m"
    sudo systemctl start postgresql
fi
echo -e "\e[32mPostgreSQL: OK\e[0m"

# Ruta base del proyecto
BASE_DIR="/home/andersonmoreno/Documentos/PROYECTO-SENA-TIENDA-TEXTIL-/tienda digital de telas"

# 2. Iniciar el Backend Java en segundo plano
echo -e "\e[33mIniciando Backend Java (puerto 8081)...\e[0m"
export DB_PASSWORD="Mp.1025889078"
export DB_USER="postgres"
export DB_URL="jdbc:postgresql://localhost:5432/tienda_digital_textiles_db"

cd "$BASE_DIR/backend-java/conexionPostgres" || exit
# En Linux el separador de classpath es ":" en lugar de ";"
nohup java -cp "bin:lib/*" App > backend.log 2>&1 &
BACKEND_PID=$!
echo -e "\e[32mBackend lanzado (PID: $BACKEND_PID). Revisa backend.log para detalles.\e[0m"

sleep 3

# 3. Iniciar el Frontend React en segundo plano
echo -e "\e[33mIniciando Frontend React (puerto 5173)...\e[0m"
cd "$BASE_DIR" || exit
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "\e[32mFrontend lanzado (PID: $FRONTEND_PID). Revisa frontend.log para detalles.\e[0m"

sleep 4

# 4. Abrir navegador
echo -e "\e[36mAbriendo http://localhost:5173 en el navegador...\e[0m"
xdg-open "http://localhost:5173" 2>/dev/null || echo -e "\e[33mPor favor abre http://localhost:5173 manualmente en tu navegador.\e[0m"

echo ""
echo -e "\e[32m=== Plataforma iniciada correctamente ===\e[0m"
echo -e "  Frontend: http://localhost:5173"
echo -e "  Backend:  http://localhost:8081"
echo ""
echo -e "\e[33mCredenciales de acceso:\e[0m"
echo -e "  Admin:    admin@ddtextil.com    / admin123"
echo -e "  Vendedor: vendedor@ddtextil.com / vendedor123"
echo -e "  Cliente:  cliente@ddtextil.com  / cliente123"
echo ""
echo -e "\e[31mPara detener los servicios cuando termines, ejecuta:\e[0m"
echo -e "kill $BACKEND_PID $FRONTEND_PID"
