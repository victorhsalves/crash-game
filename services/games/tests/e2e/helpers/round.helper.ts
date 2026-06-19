import { E2E_CONFIG } from "./config";
import { apiRequest } from "./http.helper";

export interface CurrentRoundDto {
  id: string;
  status: "WAITING" | "BETTING" | "RUNNING" | "CRASHED" | "FINISHED";
  currentMultiplier: string | null;
  crashPoint: string | null;
  bettingEndsAt: string | null;
  startedAt: string | null;
  crashedAt: string | null;
}

export async function getCurrentRound(): Promise<CurrentRoundDto> {
  const response = await apiRequest<CurrentRoundDto>("/games/rounds/current");

  if (response.status !== 200) {
    throw new Error(`Failed to get current round: ${response.status} ${JSON.stringify(response.data)}`);
  }

  return response.data;
}

export async function waitForRoundStatus(
  status: CurrentRoundDto["status"],
  timeoutMs: number = E2E_CONFIG.defaultTimeoutMs,
): Promise<CurrentRoundDto> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const round = await getCurrentRound();

    if (round.status === status) {
      return round;
    }

    await sleep(E2E_CONFIG.pollIntervalMs);
  }

  throw new Error(`Timed out waiting for round status "${status}"`);
}

export async function waitForBettingRound(
  timeoutMs: number = E2E_CONFIG.defaultTimeoutMs,
): Promise<CurrentRoundDto> {
  return waitForRoundStatus("BETTING", timeoutMs);
}

export async function waitForFreshBettingRound(
  timeoutMs: number = E2E_CONFIG.defaultTimeoutMs,
): Promise<CurrentRoundDto> {
  const initialRound = await getCurrentRound();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const round = await getCurrentRound();

    if (round.status === "BETTING" && round.id !== initialRound.id) {
      return round;
    }

    if (round.status === "BETTING" && initialRound.status !== "BETTING") {
      return round;
    }

    await sleep(E2E_CONFIG.pollIntervalMs);
  }

  return waitForBettingRound(timeoutMs);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
