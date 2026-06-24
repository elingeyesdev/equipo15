# ── ETAPA BUILDER ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependencias (aprovecha caché de Docker)
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copiar fuentes (incluye .env para que Vite acceda a VITE_* en build-time)
COPY . .
RUN pnpm build

# ── ETAPA PRODUCTION ────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY server.mjs ./server.mjs

EXPOSE 5173
CMD ["node", "server.mjs"]