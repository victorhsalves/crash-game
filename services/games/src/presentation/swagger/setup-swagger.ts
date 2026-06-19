import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const WEBSOCKET_EVENTS_DESCRIPTION = `
## WebSocket Events

Conexão direta via Socket.IO em \`http://localhost:4001\` (não roteada pelo Kong).
Autenticação: JWT no handshake via \`auth.token\` (Bearer token do Keycloak).

| Evento | Direção | Payload |
|--------|---------|---------|
| \`round.betting-opened\` | S→C | roundId, status, bettingEndsAt, serverSeedHash, clientSeed, nonce |
| \`round.running\` | S→C | roundId, startedAt, serverTime, growthFactor |
| \`round.crashed\` | S→C | roundId, crashPoint, crashedAt, serverSeed, serverSeedHash, clientSeed, nonce |
| \`round.finished\` | S→C | roundId, finishedAt |
| \`bet.accepted\` | S→C | betId, status |
| \`bet.rejected\` | S→C | betId, status, reason |
| \`bet.updated\` | S→C | betId, userId, roundId, status, multiplier, payout, cashedOutAt, walletCredited |

## Autenticação REST

Obtenha um token JWT via Keycloak (realm \`crash-game\`, client \`crash-game-client\`, usuário \`player\` / \`player123\`)
e cole no botão **Authorize** do Swagger UI.
`.trim();

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("Crash Game — Games API")
    .setDescription(`REST API do Game Service.${WEBSOCKET_EVENTS_DESCRIPTION}`)
    .setVersion("1.0")
    .addServer("http://localhost:8000/games", "Kong Gateway (recomendado)")
    .addServer("http://localhost:4001", "Direto (dev)")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token OIDC do Keycloak (realm crash-game)",
      },
      "bearer",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
