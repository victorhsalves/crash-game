import { E2E_CONFIG } from "./config";
import { apiRequest } from "./http.helper";

export interface PlaceBetResponseDto {
  betId: string;
  status: "PENDING";
}

export interface BetResponseDto {
  id: string;
  playerId: string;
  roundId: string;
  amount: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CASHED_OUT" | "LOST";
  createdAt: string;
}

export interface CashoutBetResponseDto {
  betId: string;
  roundId: string;
  status: "CASHED_OUT";
  multiplier: number;
  payout: number;
  cashedOutAt: string;
  alreadyCashedOut: boolean;
}

export async function placeBet(
  token: string,
  amountCents: number,
  socketId?: string,
): Promise<{ status: number; data: PlaceBetResponseDto | Record<string, unknown> }> {
  return apiRequest<PlaceBetResponseDto | Record<string, unknown>>("/games/bet", {
    method: "POST",
    token,
    body: {
      amountCents,
      ...(socketId !== undefined ? { socketId } : {}),
    },
  });
}

export async function cashoutBet(
  token: string,
): Promise<{ status: number; data: CashoutBetResponseDto | Record<string, unknown> }> {
  return apiRequest<CashoutBetResponseDto | Record<string, unknown>>("/games/bet/cashout", {
    method: "POST",
    token,
  });
}

export async function getBet(token: string, betId: string): Promise<BetResponseDto> {
  const response = await apiRequest<BetResponseDto>(`/games/bets/${betId}`, { token });

  if (response.status !== 200) {
    throw new Error(`Failed to get bet: ${response.status} ${JSON.stringify(response.data)}`);
  }

  return response.data;
}

export async function waitForBetStatus(
  token: string,
  betId: string,
  status: BetResponseDto["status"],
  timeoutMs: number = E2E_CONFIG.defaultTimeoutMs,
): Promise<BetResponseDto> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const bet = await getBet(token, betId);

    if (bet.status === status) {
      return bet;
    }

    await new Promise((resolve) => setTimeout(resolve, E2E_CONFIG.pollIntervalMs));
  }

  throw new Error(`Timed out waiting for bet ${betId} status "${status}"`);
}
