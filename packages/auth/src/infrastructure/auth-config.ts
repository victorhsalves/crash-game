export interface AuthConfig {
  issuer: string | string[];
  jwksUri: string;
  audience: string;
}

function parseIssuer(value: string): string | string[] {
  const issuers = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (issuers.length === 0) {
    throw new Error("KEYCLOAK_ISSUER is required to configure JWT authentication.");
  }

  return issuers.length === 1 ? issuers[0] : issuers;
}

export function buildAuthConfig(): AuthConfig {
  const issuer = process.env.KEYCLOAK_ISSUER;
  const jwksUri = process.env.KEYCLOAK_JWKS_URI;
  const audience = process.env.KEYCLOAK_AUDIENCE;

  if (!issuer) {
    throw new Error("KEYCLOAK_ISSUER is required to configure JWT authentication.");
  }

  if (!jwksUri) {
    throw new Error("KEYCLOAK_JWKS_URI is required to configure JWT authentication.");
  }

  if (!audience) {
    throw new Error("KEYCLOAK_AUDIENCE is required to configure JWT authentication.");
  }

  return { issuer: parseIssuer(issuer), jwksUri, audience };
}
