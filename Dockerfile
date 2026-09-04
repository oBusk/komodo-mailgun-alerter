FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 --ingroup app app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json index.ts format.ts ./

USER app
EXPOSE 3000

CMD ["bun", "index.ts"]
