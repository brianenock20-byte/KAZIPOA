# syntax=docker/dockerfile:1
FROM node:22-slim AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate \
    && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ---- Runtime image ---------------------------------------------------------
# NOTE: installs full deps (not --prod). server/_core/vite.ts has a
# top-level `import { createServer } from "vite"` used only on its dev-mode
# code path, but since it's a static import, Node needs the package present
# at boot even in production, or it crashes with ERR_MODULE_NOT_FOUND.
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate \
    && pnpm install --frozen-lockfile

COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts

EXPOSE 3000
CMD ["node", "dist/index.js"]
