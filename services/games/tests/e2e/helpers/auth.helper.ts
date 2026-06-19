import { E2E_CONFIG } from "./config";

interface TokenResponse {
  access_token: string;
}

export async function getKeycloakToken(
  username: string = E2E_CONFIG.testUsername,
  password: string = E2E_CONFIG.testPassword,
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: E2E_CONFIG.keycloakClientId,
    username,
    password,
  });

  const response = await fetch(E2E_CONFIG.keycloakTokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain Keycloak token: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as TokenResponse;

  if (!data.access_token) {
    throw new Error("Keycloak token response missing access_token");
  }

  return data.access_token;
}
