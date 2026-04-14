# syntax=docker/dockerfile:1
# MILAM Next.js app — production image for Nosana deployment.
# Multi-stage: build with all deps, ship only what `next start` needs.

############################
# 1. deps — install once
############################
FROM node:23-slim AS deps
RUN apt-get update && apt-get install -y python3 make g++ git && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@10
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

############################
# 2. build — compile Next.js
############################
FROM node:23-slim AS build
RUN npm install -g pnpm@10
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Skip the turbopack root pin at build time (it's a dev-only concern).
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm build

############################
# 3. runtime — minimal
############################
FROM node:23-slim AS runtime
RUN npm install -g pnpm@10
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# pnpm-fetched modules are symlinked; we need the full store for `next start`.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json

# Local dream fallback dir (only used if CORTEX_API_KEY unset).
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["pnpm", "start"]
