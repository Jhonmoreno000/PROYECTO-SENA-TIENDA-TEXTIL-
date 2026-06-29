#!/bin/bash
# D&D Textil - Script de construcción con Docker
# Construye las imágenes y levanta los servicios

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/tienda digital de telas"

echo "=== D&D Textil - Construyendo imágenes Docker ==="

# Verificar node_modules, instalarlos si es necesario
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo ""
    echo "-> Instalando dependencias del frontend..."
    cd "$FRONTEND_DIR"
    npm ci
fi

echo ""
echo "1. Construyendo backend..."
docker build --network=host -t proyecto-sena-tienda-textil--backend \
  "$FRONTEND_DIR/backend-java/conexionPostgres"

echo ""
echo "2. Construyendo frontend..."
docker build --network=host -t proyecto-sena-tienda-textil--frontend \
  "$FRONTEND_DIR"

echo ""
echo "3. Levantando servicios..."
cd "$SCRIPT_DIR"
docker compose up -d --no-build

echo ""
echo "=== Listo ==="
echo "Frontend: http://localhost:3001"
echo "Backend:  http://localhost:8081"
