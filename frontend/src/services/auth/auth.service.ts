import { useAuthStore } from "@/stores/auth.store";
import type { PkceState, StoredSession, TokenResponse } from "@/types/auth.types";
import { OIDC_CONFIG } from "@/services/auth/oidc.constants";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from "@/services/auth/pkce.util";

const SESSION_STORAGE_KEY = "crash-game.auth.session";
const PKCE_STORAGE_KEY = "crash-game.auth.pkce";

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
    idToken: tokens.id_token,
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

function loadPkceState(): PkceState | null {
  const raw = sessionStorage.getItem(PKCE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PkceState;
  } catch {
    sessionStorage.removeItem(PKCE_STORAGE_KEY);
    return null;
  }
}

function savePkceState(state: PkceState): void {
  sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(state));
}

function clearPkceState(): void {
  sessionStorage.removeItem(PKCE_STORAGE_KEY);
}

async function requestToken(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(OIDC_CONFIG.tokenUrl, {
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
      client_id: OIDC_CONFIG.clientId,
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

  async loginRedirect(returnTo?: string): Promise<void> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    savePkceState({ codeVerifier, state, returnTo });

    const params = new URLSearchParams({
      client_id: OIDC_CONFIG.clientId,
      redirect_uri: OIDC_CONFIG.redirectUri,
      response_type: "code",
      scope: OIDC_CONFIG.scopes,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    window.location.assign(`${OIDC_CONFIG.authUrl}?${params.toString()}`);
  },

  async handleCallback(code: string, state: string): Promise<string> {
    const pkce = loadPkceState();
    clearPkceState();

    if (!pkce || pkce.state !== state) {
      clearSession();
      throw new Error("Estado de autenticacao invalido. Tente novamente.");
    }

    const tokens = await requestToken(
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: OIDC_CONFIG.clientId,
        code,
        redirect_uri: OIDC_CONFIG.redirectUri,
        code_verifier: pkce.codeVerifier,
      }),
    );

    saveSession(tokens);
    return pkce.returnTo ?? "/dashboard";
  },

  async logout(): Promise<void> {
    const session = loadSession();
    clearSession();

    const params = new URLSearchParams({
      client_id: OIDC_CONFIG.clientId,
      post_logout_redirect_uri: OIDC_CONFIG.postLogoutRedirectUri,
    });

    if (session?.idToken) {
      params.set("id_token_hint", session.idToken);
    }

    window.location.assign(`${OIDC_CONFIG.logoutUrl}?${params.toString()}`);
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
