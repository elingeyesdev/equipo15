#!/bin/sh
set -e

echo "[entrypoint] Sincronizando esquema Prisma..."
npx prisma db push --accept-data-loss
echo "[entrypoint] Migraciones OK. Iniciando servidor..."

exec node dist/src/main.js
