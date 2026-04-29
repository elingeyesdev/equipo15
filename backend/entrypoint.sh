#!/bin/sh
set -e

echo "[entrypoint] Aplicando migraciones Prisma..."
npx prisma migrate deploy
echo "[entrypoint] Migraciones OK. Iniciando servidor..."

exec node dist/src/main.js
