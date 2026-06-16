export interface AuthConfig {
  issuer: string;
  jwksUri: string;
  audience: string;
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

  return { issuer, jwksUri, audience };
}
