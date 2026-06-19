import "./setup";
import { describe, expect, it } from "bun:test";
import { getKeycloakToken } from "./helpers/auth.helper";
import { cashoutBet, placeBet, waitForBetStatus } from "./helpers/bet.helper";
import { E2E_TEST_TIMEOUT_MS } from "./helpers/config";
import { waitForBettingRound, waitForRoundStatus } from "./helpers/round.helper";
import {
  connectGameSocket,
  disconnectSocket,
  waitForSocketConnection,
} from "./helpers/websocket.helper";
import { setupWallet } from "./helpers/wallet.helper";

describe("E2E bet cashout errors", () => {
  it(
    "returns 404 when player has no bet in the running round",
    async () => {
      const token = await getKeycloakToken();
      await setupWallet(token, 10_000);

      await waitForRoundStatus("RUNNING");
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await cashoutBet(token);

      expect(response.status).toBe(404);
      expect((response.data as { error: string }).error).toBe("BetNotFoundError");
    },
    E2E_TEST_TIMEOUT_MS,
  );

  it(
    "returns 422 when round is not running",
    async () => {
      const token = await getKeycloakToken();
      await setupWallet(token, 10_000);

      await waitForRoundStatus("BETTING");

      const response = await cashoutBet(token);

      expect(response.status).toBe(422);
      expect((response.data as { error: string }).error).toBe("RoundNotRunningError");
    },
    E2E_TEST_TIMEOUT_MS,
  );

  it(
    "returns 422 when round has already crashed",
    async () => {
      const token = await getKeycloakToken();
      await setupWallet(token, 10_000);

      const socket = connectGameSocket(token);

      try {
        await waitForSocketConnection(socket);
        await waitForBettingRound();

        const response = await placeBet(token, 1000, socket.id);
        expect(response.status).toBe(201);

        const betId = (response.data as { betId: string }).betId;
        await waitForBetStatus(token, betId, "ACCEPTED");

        await waitForRoundStatus("RUNNING");
        await waitForRoundStatus("CRASHED");

        const cashoutResponse = await cashoutBet(token);

        expect(cashoutResponse.status).toBe(422);
        expect((cashoutResponse.data as { error: string }).error).toBe("RoundNotRunningError");
      } finally {
        await disconnectSocket(socket);
      }
    },
    E2E_TEST_TIMEOUT_MS,
  );

  it(
    "returns 200 with alreadyCashedOut on idempotent cashout",
    async () => {
      const token = await getKeycloakToken();
      await setupWallet(token, 10_000);

      const socket = connectGameSocket(token);

      try {
        await waitForSocketConnection(socket);
        await waitForBettingRound();

        const response = await placeBet(token, 1000, socket.id);
        expect(response.status).toBe(201);

        const betId = (response.data as { betId: string }).betId;
        await waitForBetStatus(token, betId, "ACCEPTED");

        await waitForRoundStatus("RUNNING");
        await new Promise((resolve) => setTimeout(resolve, 500));

        const firstCashout = await cashoutBet(token);
        expect(firstCashout.status).toBe(200);
        expect((firstCashout.data as { alreadyCashedOut: boolean }).alreadyCashedOut).toBe(false);

        await waitForBetStatus(token, betId, "CASHED_OUT");

        const secondCashout = await cashoutBet(token);
        expect(secondCashout.status).toBe(200);
        expect((secondCashout.data as { alreadyCashedOut: boolean }).alreadyCashedOut).toBe(true);
      } finally {
        await disconnectSocket(socket);
      }
    },
    E2E_TEST_TIMEOUT_MS,
  );
});
