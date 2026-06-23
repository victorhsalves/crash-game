export interface KeycloakAdminConfig {
  adminUrl: string;
  adminRealm: string;
  adminClientId: string;
  adminUsername: string;
  adminPassword: string;
  userRealm: string;
}

function extractRealmFromIssuer(issuer: string): string | null {
  const match = issuer.match(/\/realms\/([^/]+)\/?$/);

  return match?.[1] ?? null;
}

export function buildKeycloakAdminConfig(): KeycloakAdminConfig {
  const issuer = process.env.KEYCLOAK_ISSUER;
  const adminUrl = process.env.KEYCLOAK_ADMIN_URL;
  const adminRealm = process.env.KEYCLOAK_ADMIN_REALM ?? "master";
  const adminClientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID ?? "admin-cli";
  const adminUsername = process.env.KEYCLOAK_ADMIN_USERNAME;
  const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD;

  if (!issuer) {
    throw new Error("KEYCLOAK_ISSUER is required to configure Keycloak admin client.");
  }

  if (!adminUrl) {
    throw new Error("KEYCLOAK_ADMIN_URL is required to configure Keycloak admin client.");
  }

  if (!adminUsername) {
    throw new Error("KEYCLOAK_ADMIN_USERNAME is required to configure Keycloak admin client.");
  }

  if (!adminPassword) {
    throw new Error("KEYCLOAK_ADMIN_PASSWORD is required to configure Keycloak admin client.");
  }

  const userRealm = process.env.KEYCLOAK_REALM ?? extractRealmFromIssuer(issuer);

  if (!userRealm) {
    throw new Error("KEYCLOAK_REALM is required when KEYCLOAK_ISSUER has an unexpected format.");
  }

  return {
    adminUrl: adminUrl.replace(/\/$/, ""),
    adminRealm,
    adminClientId,
    adminUsername,
    adminPassword,
    userRealm,
  };
}
