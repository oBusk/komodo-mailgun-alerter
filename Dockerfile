FROM oven/bun:1-slim
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080

COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production --ignore-scripts

COPY src/ ./src/

USER bun
EXPOSE 8080

CMD ["bun", "src/index.ts"]
