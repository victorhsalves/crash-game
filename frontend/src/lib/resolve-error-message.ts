import { ApiError, UnauthorizedError } from "@/services/api/api-error";
import type { ApiErrorResponse } from "@/types/api-error.types";

const HTTP_ERROR_MESSAGES: Record<string, string> = {
  DuplicateBetError: "Voce ja apostou nesta rodada.",
  RoundNotInBettingPhaseError: "Apostas fechadas nesta rodada.",
  BettingWindowClosedError: "Apostas fechadas nesta rodada.",
  CurrentRoundNotFoundError: "Nenhuma rodada ativa.",
  RoundNotRunningError: "Rodada nao esta em andamento.",
  RoundAlreadyCrashedError: "Rodada ja crashou.",
  BetNotFoundError: "Aposta nao encontrada.",
  BetNotAcceptedError: "Aposta ainda nao foi aceita.",
  BetAlreadySettledError: "Aposta ja finalizada.",
};

const BET_REJECTED_MESSAGES: Record<string, string> = {
  INSUFFICIENT_FUNDS: "Saldo insuficiente.",
};

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof Error && error.message.toLowerCase().includes("failed to fetch")) {
    return true;
  }

  return false;
}

function extractMessage(body: ApiErrorResponse): string | null {
  if (Array.isArray(body.message)) {
    return body.message[0] ?? null;
  }

  return body.message ?? null;
}

function parseApiErrorBody(error: ApiError): ApiErrorResponse | null {
  try {
    return JSON.parse(error.message) as ApiErrorResponse;
  } catch {
    return null;
  }
}

export function resolveErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return "Erro de conexao. Verifique sua rede.";
  }

  if (error instanceof UnauthorizedError) {
    return "Sessao expirada. Faca login novamente.";
  }

  if (error instanceof ApiError) {
    const body = parseApiErrorBody(error);

    if (body?.error !== undefined && HTTP_ERROR_MESSAGES[body.error] !== undefined) {
      return HTTP_ERROR_MESSAGES[body.error]!;
    }

    if (body !== null) {
      const message = extractMessage(body);

      if (body.statusCode === 400 && message !== null) {
        return "Valor de aposta invalido.";
      }

      if (body.statusCode === 422 && message?.includes("1.00")) {
        return "Valor deve ser entre R$ 1,00 e R$ 1.000,00.";
      }

      if (message !== null && message.length > 0) {
        return message;
      }
    }

    return "Ocorreu um erro inesperado.";
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
}

export function mapBetRejectedReason(reason: string): string {
  return BET_REJECTED_MESSAGES[reason] ?? "Aposta rejeitada.";
}

export function resolveApiErrorPayload(payload: { error?: string; message?: string }): string {
  if (payload.error !== undefined && HTTP_ERROR_MESSAGES[payload.error] !== undefined) {
    return HTTP_ERROR_MESSAGES[payload.error]!;
  }

  if (payload.message !== undefined && payload.message.length > 0) {
    return payload.message;
  }

  return "Ocorreu um erro inesperado.";
}
