export interface SocketHandshakeLike {
  readonly auth?: {
    readonly token?: unknown;
  };
}

export function extractBearerTokenFromHandshake(handshake: SocketHandshakeLike): string | null {
  const token = handshake.auth?.token;

  if (typeof token !== "string" || token.trim().length === 0) {
    return null;
  }

  return token;
}

export function createAuthorizationRequest(handshake: SocketHandshakeLike): { headers: { authorization: string } } {
  const token = extractBearerTokenFromHandshake(handshake);

  return {
    headers: {
      authorization: token !== null ? `Bearer ${token}` : "",
    },
  };
}
