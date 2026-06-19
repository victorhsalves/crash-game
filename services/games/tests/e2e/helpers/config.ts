export const E2E_CONFIG = {
  kongBaseUrl: process.env.E2E_KONG_URL ?? "http://localhost:8000",
  gamesWsUrl: process.env.E2E_GAMES_WS_URL ?? "http://localhost:4001",
  keycloakTokenUrl:
    process.env.E2E_KEYCLOAK_TOKEN_URL ??
    "http://localhost:8080/realms/crash-game/protocol/openid-connect/token",
  keycloakClientId: process.env.E2E_KEYCLOAK_CLIENT_ID ?? "crash-game-client",
  testUsername: process.env.E2E_TEST_USERNAME ?? "player",
  testPassword: process.env.E2E_TEST_PASSWORD ?? "player123",
  pollIntervalMs: 200,
  defaultTimeoutMs: 90_000,
} as const;

export const E2E_TEST_TIMEOUT_MS = E2E_CONFIG.defaultTimeoutMs;
