FROM node:20-alpine AS production
WORKDIR /app

COPY dist ./dist
COPY server.mjs ./server.mjs

EXPOSE 5173
CMD ["node", "server.mjs"]