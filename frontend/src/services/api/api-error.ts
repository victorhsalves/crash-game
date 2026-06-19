export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export interface ApiErrorPayload {
  error?: string;
  message?: string;
  statusCode?: number;
}

export function parseApiError(error: unknown): ApiErrorPayload {
  if (!(error instanceof ApiError)) {
    return { message: error instanceof Error ? error.message : "Unknown error" };
  }

  try {
    return JSON.parse(error.message) as ApiErrorPayload;
  } catch {
    return { statusCode: error.status, message: error.message };
  }
}
