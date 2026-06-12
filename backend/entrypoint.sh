#!/bin/sh
set -e

echo "[entrypoint] Aplicando migraciones pendientes (si las hay)..."
npx prisma migrate deploy
echo "[entrypoint] Migraciones OK. Iniciando servidor..."

exec node dist/src/main.js
