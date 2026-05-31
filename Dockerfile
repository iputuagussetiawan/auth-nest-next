# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Enable corepack and install the exact pnpm version declared in package.json
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

WORKDIR /app

# Copy workspace manifests and lockfile first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY api/package.json ./api/
COPY web/package.json ./web/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Build the api package (outputs to api/dist/)
RUN cd api && pnpm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

WORKDIR /app

# Copy workspace manifests so pnpm can resolve the dependency graph
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY api/package.json ./api/
COPY web/package.json ./web/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from the build stage
COPY --from=builder /app/api/dist ./api/dist

ENV NODE_ENV=production

EXPOSE 4001

CMD ["node", "api/dist/main.js"]
