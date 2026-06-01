# ── Stage 1: build Vue app ───────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests for dependency install
COPY package.json pnpm-lock.yaml ./
COPY app/package.json ./app/package.json
# Restrict workspace to app/ only so server's bun-managed deps don't cause lockfile mismatch
RUN printf 'packages:\n  - '"'"'app'"'"'\n' > pnpm-workspace.yaml

# Install app deps only
RUN pnpm install --frozen-lockfile --filter @mipueblo/web

# Copy app source and build
COPY app ./app
RUN pnpm --filter @mipueblo/web build

# ── Stage 2: serve with nginx (brotli-capable) ────────────────────
FROM fholzer/nginx-brotli:v1.27.0

COPY --from=builder /app/app/dist /usr/share/nginx/html
COPY app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
