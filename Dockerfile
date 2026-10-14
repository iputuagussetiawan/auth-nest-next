# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Enable corepack and install the exact pnpm version declared in package.json
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

WORKDIR /app

# Copy workspace manifests and lockfile first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Build the api and its workspace dependencies (api outputs to apps/api/dist/src/ because drizzle.config.ts sits at the api root)
RUN pnpm turbo run build --filter=api

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

WORKDIR /app

# Copy workspace manifests so pnpm can resolve the dependency graph
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install production dependencies for the api and its workspace deps only (skips web/Next.js)
RUN pnpm install --frozen-lockfile --prod --filter "api..."

# Copy compiled output from the build stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

ENV NODE_ENV=production

# Drop root privileges for the running process
USER node

EXPOSE 4001

CMD ["node", "apps/api/dist/src/main.js"]
