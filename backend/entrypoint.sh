#!/bin/sh
set -e

echo "[entrypoint] Aplicando migraciones pendientes (si las hay)..."
npx prisma@6.2.1 migrate deploy
echo "[entrypoint] Migraciones OK. Poblando datos esenciales..."
npx prisma@6.2.1 db seed
echo "[entrypoint] Seed OK. Iniciando servidor..."

exec node dist/src/main.js
