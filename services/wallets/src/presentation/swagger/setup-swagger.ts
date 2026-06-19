import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const AUTH_DESCRIPTION = `
## Autenticação

Obtenha um token JWT via Keycloak (realm \`crash-game\`, client \`crash-game-client\`, usuário \`player\` / \`player123\`)
e cole no botão **Authorize** do Swagger UI.
`.trim();

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("Crash Game — Wallets API")
    .setDescription(`REST API do Wallet Service.${AUTH_DESCRIPTION}`)
    .setVersion("1.0")
    .addServer("http://localhost:8000/wallets", "Kong Gateway (recomendado)")
    .addServer("http://localhost:4002", "Direto (dev)")
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
