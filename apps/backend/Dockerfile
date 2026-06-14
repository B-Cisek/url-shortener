FROM node:24-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

FROM base AS build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @url-shortener/backend...

COPY apps/backend apps/backend

RUN pnpm --filter @url-shortener/backend build \
    && pnpm --filter @url-shortener/backend deploy --prod --legacy /prod/backend

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV APP_PORT=3000

WORKDIR /app

COPY --from=build --chown=node:node /prod/backend ./

USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
