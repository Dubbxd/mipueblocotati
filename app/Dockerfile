# ── Stage 1: build Vue app ───────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests for dependency install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY app/package.json ./app/package.json
# server/package.json is referenced by the pnpm workspace — create a stub so
# pnpm doesn't fail when resolving the workspace graph
COPY server/package.json ./server/package.json

# Install all workspace deps (includes app's devDependencies for building)
RUN pnpm install --frozen-lockfile

# Copy app source and build
COPY app ./app
RUN pnpm --filter @mipueblo/web build

# ── Stage 2: serve with nginx ────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/app/dist /usr/share/nginx/html
COPY app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
