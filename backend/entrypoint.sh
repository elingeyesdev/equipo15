#!/bin/sh
set -e

echo "[entrypoint] Aplicando migraciones Prisma..."
npx prisma migrate deploy
echo "[entrypoint] Migraciones OK. Iniciando poblamiento (seed)..."
node dist/prisma/seed.js
echo "[entrypoint] Seed OK. Iniciando servidor..."

exec node dist/src/main.js
