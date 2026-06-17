import { ApplicationError } from "../../application/errors/application-error";
import { BetAlreadySettledError } from "../../application/errors/bet-already-settled.error";
import { BetNotAcceptedError } from "../../application/errors/bet-not-accepted.error";
import { BetNotFoundError } from "../../application/errors/bet-not-found.error";
import { RoundAlreadyCrashedError } from "../../application/errors/round-already-crashed.error";
import { RoundNotRunningError } from "../../application/errors/round-not-running.error";
import type { CashoutErrorCode } from "../contracts/websocket-bet-events";

export function mapCashoutError(error: unknown): { code: CashoutErrorCode; message: string } {
  if (error instanceof RoundNotRunningError) {
    return { code: "ROUND_NOT_RUNNING", message: error.message };
  }

  if (error instanceof RoundAlreadyCrashedError) {
    return { code: "ROUND_ALREADY_CRASHED", message: error.message };
  }

  if (error instanceof BetNotFoundError) {
    return { code: "BET_NOT_FOUND", message: error.message };
  }

  if (error instanceof BetNotAcceptedError) {
    return { code: "BET_NOT_ACCEPTED", message: error.message };
  }

  if (error instanceof BetAlreadySettledError) {
    return { code: "BET_ALREADY_SETTLED", message: error.message };
  }

  if (error instanceof ApplicationError) {
    return { code: "INTERNAL_ERROR", message: error.message };
  }

  if (error instanceof Error) {
    return { code: "INTERNAL_ERROR", message: error.message };
  }

  return { code: "INTERNAL_ERROR", message: "An unexpected error occurred." };
}
