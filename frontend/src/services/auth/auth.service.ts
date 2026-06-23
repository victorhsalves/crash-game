import { useAuthStore } from "@/stores/auth.store";
import type { StoredSession, TokenResponse } from "@/types/auth.types";

const SESSION_STORAGE_KEY = "crash-game.auth.session";
const TOKEN_URL = `${import.meta.env.VITE_OIDC_AUTHORITY}/protocol/openid-connect/token`;
const CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID;

let sessionExpiredHandler: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void): void {
  sessionExpiredHandler = handler;
}

function loadSession(): StoredSession | null {
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function saveSession(tokens: TokenResponse): void {
  const now = Date.now();
  const session: StoredSession = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: now + tokens.expires_in * 1000,
    refreshExpiresAt: now + tokens.refresh_expires_in * 1000,
  };

  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  useAuthStore.getState().setAuthenticated(true);
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  useAuthStore.getState().clear();
}

async function requestToken(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || "Falha na autenticacao");
  }

  return response.json() as Promise<TokenResponse>;
}

async function refreshSession(session: StoredSession): Promise<string | null> {
  if (Date.now() >= session.refreshExpiresAt) {
    clearSession();
    sessionExpiredHandler?.();
    return null;
  }

  const tokens = await requestToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      refresh_token: session.refreshToken,
    }),
  );

  saveSession(tokens);
  return tokens.access_token;
}

export const authService = {
  async initialize(): Promise<void> {
    const store = useAuthStore.getState();
    store.setLoading(true);

    try {
      const session = loadSession();

      if (!session) {
        store.setAuthenticated(false);
        return;
      }

      if (Date.now() < session.expiresAt) {
        store.setAuthenticated(true);
        return;
      }

      const accessToken = await refreshSession(session);
      store.setAuthenticated(!!accessToken);
    } catch {
      clearSession();
    } finally {
      store.setLoading(false);
      store.setInitialized(true);
    }
  },

  async login(username: string, password: string): Promise<void> {
    const tokens = await requestToken(
      new URLSearchParams({
        grant_type: "password",
        client_id: CLIENT_ID,
        username,
        password,
      }),
    );

    saveSession(tokens);
  },

  logout(): void {
    clearSession();
  },

  async getAccessToken(): Promise<string | null> {
    const session = loadSession();

    if (!session) {
      return null;
    }

    if (Date.now() < session.expiresAt - 30_000) {
      return session.accessToken;
    }

    try {
      return await refreshSession(session);
    } catch {
      clearSession();
      sessionExpiredHandler?.();
      return null;
    }
  },
};
