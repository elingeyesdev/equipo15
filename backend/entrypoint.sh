#!/bin/sh
set -e

echo "[entrypoint] Sincronizando esquema Prisma..."
npx prisma db push --force-reset --skip-generate
echo "[entrypoint] Migraciones OK. Iniciando poblamiento (seed)..."
npx prisma db seed
echo "[entrypoint] Seed OK. Iniciando servidor..."

exec node dist/src/main.js
