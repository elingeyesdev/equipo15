# ── ETAPA BUILDER ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN npx prisma generate
RUN pnpm build

# ── ETAPA PRODUCTION ────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
# --prod excluye devDependencies. 'prisma' CLI debe estar en dependencies del package.json
RUN pnpm install --frozen-lockfile --prod

# Copiar artefactos compilados y schema/migraciones de Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/firebase-admin.json ./firebase-admin.json

# Regenerar cliente Prisma para la arquitectura del contenedor (Linux/amd64)
# No alcanza copiar el cliente del builder: puede haber sido compilado en Windows o Mac ARM
RUN npx prisma generate

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
