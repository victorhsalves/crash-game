const authority = import.meta.env.VITE_OIDC_AUTHORITY;

export const OIDC_CONFIG = {
  authority,
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirectUri: import.meta.env.VITE_OIDC_REDIRECT_URI,
  postLogoutRedirectUri: import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI,
  scopes: import.meta.env.VITE_OIDC_SCOPES,
  authUrl: `${authority}/protocol/openid-connect/auth`,
  tokenUrl: `${authority}/protocol/openid-connect/token`,
  logoutUrl: `${authority}/protocol/openid-connect/logout`,
} as const;
