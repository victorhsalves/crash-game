import "./setup";
import { describe, expect, it } from "bun:test";
import { getKeycloakToken } from "./helpers/auth.helper";
import { placeBet, waitForBetStatus } from "./helpers/bet.helper";
import { E2E_TEST_TIMEOUT_MS } from "./helpers/config";
import { waitForBettingRound, waitForRoundStatus } from "./helpers/round.helper";
import {
  connectGameSocket,
  disconnectSocket,
  waitForSocketConnection,
} from "./helpers/websocket.helper";
import { getWallet, parseBalanceCents, setupWallet } from "./helpers/wallet.helper";

describe("E2E bet crash lost", () => {
  it(
    "loses bet on crash without cashout and keeps debited balance",
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

        const balanceAfterDebit = parseBalanceCents((await getWallet(token))!);

        await waitForRoundStatus("RUNNING");
        await waitForRoundStatus("CRASHED");

        const bet = await waitForBetStatus(token, betId, "LOST");
        expect(bet.status).toBe("LOST");

        const finalBalance = parseBalanceCents((await getWallet(token))!);
        expect(finalBalance).toBe(balanceAfterDebit);
      } finally {
        await disconnectSocket(socket);
      }
    },
    E2E_TEST_TIMEOUT_MS,
  );
});
