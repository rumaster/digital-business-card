# ---------- Stage 1: build ----------
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# ---------- Stage 2: production ----------
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/src/generated ./src/generated
COPY --chown=node:node prisma ./prisma/
COPY --chown=node:node prisma.config.ts ./

COPY --chown=node:node docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

RUN chown node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]