import { E2E_CONFIG } from "./config";

export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
  } = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${E2E_CONFIG.kongBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data: T;

  if (text.length === 0) {
    data = {} as T;
  } else {
    data = JSON.parse(text) as T;
  }

  return { status: response.status, data };
}

export async function assertServicesHealthy(): Promise<void> {
  const [gamesHealth, walletsHealth] = await Promise.all([
    apiRequest<{ status: string }>("/games/health"),
    apiRequest<{ status: string }>("/wallets/health"),
  ]);

  if (gamesHealth.status !== 200 || gamesHealth.data.status !== "ok") {
    throw new Error("Games service is not healthy. Run `bun run docker:up` first.");
  }

  if (walletsHealth.status !== 200 || walletsHealth.data.status !== "ok") {
    throw new Error("Wallets service is not healthy. Run `bun run docker:up` first.");
  }
}
