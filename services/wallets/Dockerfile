FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY packages/money ./packages/money
COPY packages/auth ./packages/auth
COPY packages/messaging ./packages/messaging
COPY packages/provably-fair ./packages/provably-fair
COPY frontend ./frontend
COPY services/wallets ./services/wallets

RUN bun install

WORKDIR /app/services/wallets

EXPOSE 4002

CMD ["bun", "run", "start:docker"]
