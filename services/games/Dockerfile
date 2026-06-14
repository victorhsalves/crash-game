FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY packages/money ./packages/money
COPY services/games ./services/games

RUN bun install

WORKDIR /app/services/games

EXPOSE 4001

CMD ["bun", "run", "src/main.ts"]
