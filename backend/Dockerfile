# ── ETAPA BUILDER ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY . .
RUN npx prisma generate
RUN pnpm build
RUN pnpm prune --prod --ignore-scripts

# ── ETAPA PRODUCTION ────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Copiar artefactos compilados y dependencias de producción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules


COPY entrypoint.sh ./entrypoint.sh
COPY firebase-admin.json ./firebase-admin.json
RUN apk add --no-cache dos2unix && dos2unix entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
