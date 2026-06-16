FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY packages/money ./packages/money
COPY packages/auth ./packages/auth
COPY services/wallets ./services/wallets

RUN bun install

WORKDIR /app/services/wallets

EXPOSE 4002

CMD ["bun", "run", "src/main.ts"]
