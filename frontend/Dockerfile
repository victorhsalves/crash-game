FROM oven/bun:1-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY packages/provably-fair ./packages/provably-fair
COPY frontend ./frontend

RUN bun install

WORKDIR /app/frontend

ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_OIDC_AUTHORITY=http://localhost:8080/realms/crash-game
ARG VITE_OIDC_CLIENT_ID=crash-game-client
ARG VITE_WS_URL=http://localhost:4001

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_OIDC_AUTHORITY=$VITE_OIDC_AUTHORITY
ENV VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID
ENV VITE_WS_URL=$VITE_WS_URL

RUN bun run build

FROM nginx:1.27-alpine AS runtime

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
