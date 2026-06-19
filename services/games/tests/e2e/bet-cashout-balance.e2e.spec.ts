import "./setup";
import { describe, expect, it } from "bun:test";
import { getKeycloakToken } from "./helpers/auth.helper";
import { cashoutBet, getBet, placeBet, waitForBetStatus } from "./helpers/bet.helper";
import { E2E_TEST_TIMEOUT_MS } from "./helpers/config";
import { waitForBettingRound, waitForRoundStatus } from "./helpers/round.helper";
import {
  connectGameSocket,
  disconnectSocket,
  waitForSocketConnection,
  waitForWsEvent,
} from "./helpers/websocket.helper";
import { getWallet, parseBalanceCents, setupWallet, waitForWalletBalance } from "./helpers/wallet.helper";

describe("E2E bet cashout balance", () => {
  it(
    "credits wallet after cashout and round crash",
    async () => {
      const token = await getKeycloakToken();
      await setupWallet(token, 10_000);

      const socket = connectGameSocket(token);
      const betAmountCents = 1000;

      try {
        await waitForSocketConnection(socket);
        await waitForBettingRound();

        const response = await placeBet(token, betAmountCents, socket.id);
        expect(response.status).toBe(201);

        const betId = (response.data as { betId: string }).betId;

        await waitForBetStatus(token, betId, "ACCEPTED");

        const balanceAfterDebit = parseBalanceCents((await getWallet(token))!);
        expect(balanceAfterDebit).toBe(10_000n - BigInt(betAmountCents));

        await waitForRoundStatus("RUNNING");
        await new Promise((resolve) => setTimeout(resolve, 500));

        const updatedPromise = waitForWsEvent<{ betId: string; status: string }>(
          socket,
          "bet.updated",
          (payload) => payload.betId === betId && payload.status === "CASHED_OUT",
        );

        const cashoutResponse = await cashoutBet(token);
        expect(cashoutResponse.status).toBe(200);

        const cashoutData = cashoutResponse.data as {
          betId: string;
          status: string;
          multiplier: number;
          alreadyCashedOut: boolean;
        };
        expect(cashoutData.betId).toBe(betId);
        expect(cashoutData.status).toBe("CASHED_OUT");
        expect(cashoutData.multiplier).toBeGreaterThan(1);
        expect(cashoutData.alreadyCashedOut).toBe(false);

        const updated = await updatedPromise;
        expect(updated.status).toBe("CASHED_OUT");

        await waitForBetStatus(token, betId, "CASHED_OUT");
        await waitForRoundStatus("CRASHED");

        await waitForWalletBalance(token, (balance) => balance > balanceAfterDebit);

        const finalBalance = parseBalanceCents((await getWallet(token))!);
        expect(finalBalance).toBeGreaterThan(balanceAfterDebit);

        const refreshedBet = await getBet(token, betId);
        expect(refreshedBet.status).toBe("CASHED_OUT");
      } finally {
        await disconnectSocket(socket);
      }
    },
    E2E_TEST_TIMEOUT_MS,
  );
});
