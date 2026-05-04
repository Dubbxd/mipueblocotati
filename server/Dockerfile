# ── Stage 1: install deps ────────────────────────────────────────
FROM oven/bun:1.2-alpine AS deps
WORKDIR /app

COPY server/package.json server/bun.lock ./
RUN bun install --frozen-lockfile --production

# ── Stage 2: runtime ─────────────────────────────────────────────
FROM oven/bun:1.2-alpine
WORKDIR /app

# Copy installed deps
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY server/src ./src
COPY server/drizzle ./drizzle
COPY server/scripts ./scripts
COPY server/tsconfig.json ./tsconfig.json
COPY server/package.json ./package.json

# Copy email logo (resolves LOGO_PATH=/app/email-logo.png at runtime)
COPY app/public/assets/logos/logo-cotati-secondary.png ./email-logo.png

# Persist uploads across restarts via a named volume
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=3001
ENV LOGO_PATH=/app/email-logo.png

EXPOSE 3001

# Run migrations then start the API
CMD ["sh", "-c", "(bun run src/db/migrate.ts || echo 'WARN: migrations failed, check DATABASE_URL') && (bun run src/db/seed.ts || echo 'WARN: seed failed, continuing') && bun run src/index.ts"]
