import "./setup";
import { describe, expect, it } from "bun:test";
import { getKeycloakToken } from "./helpers/auth.helper";
import { placeBet, waitForBetStatus } from "./helpers/bet.helper";
import { E2E_TEST_TIMEOUT_MS } from "./helpers/config";
import { waitForRoundStatus } from "./helpers/round.helper";
import {
  connectGameSocket,
  disconnectSocket,
  waitForSocketConnection,
  waitForWsEvent,
} from "./helpers/websocket.helper";
import { getWallet, parseBalanceCents, setupWallet } from "./helpers/wallet.helper";

describe("E2E validation errors", () => {
  it(
    "rejects bet when wallet has insufficient balance",
    async () => {
      const token = await getKeycloakToken();
      await setupWallet(token, 500);

      const socket = connectGameSocket(token);

      try {
        await waitForSocketConnection(socket);
        await waitForRoundStatus("BETTING");

        const balanceBefore = parseBalanceCents((await getWallet(token))!);

        const rejectedPromise = waitForWsEvent<{ betId: string; status: string; reason: string }>(
          socket,
          "bet.rejected",
          (payload) => payload.reason === "INSUFFICIENT_FUNDS",
        );

        const response = await placeBet(token, 1000, socket.id);

        expect(response.status).toBe(201);
        expect((response.data as { status: string }).status).toBe("PENDING");

        const rejected = await rejectedPromise;
        expect(rejected.status).toBe("REJECTED");
        expect(rejected.reason).toBe("INSUFFICIENT_FUNDS");

        const balanceAfter = parseBalanceCents((await getWallet(token))!);
        expect(balanceAfter).toBe(balanceBefore);
      } finally {
        await disconnectSocket(socket);
      }
    },
    E2E_TEST_TIMEOUT_MS,
  );

  it(
    "rejects duplicate bet in the same round",
    async () => {
      const token = await getKeycloakToken();
      await setupWallet(token, 10_000);

      const socket = connectGameSocket(token);

      try {
        await waitForSocketConnection(socket);
        await waitForRoundStatus("BETTING");

        const first = await placeBet(token, 1000, socket.id);

        if (first.status === 201) {
          await waitForBetStatus(token, (first.data as { betId: string }).betId, "ACCEPTED");
        } else {
          expect(first.status).toBe(409);
        }

        const second = await placeBet(token, 1000, socket.id);

        expect(second.status).toBe(409);
        expect((second.data as { error: string }).error).toBe("DuplicateBetError");
      } finally {
        await disconnectSocket(socket);
      }
    },
    E2E_TEST_TIMEOUT_MS,
  );

  it(
    "rejects bet when round is running",
    async () => {
      const token = await getKeycloakToken();
      await setupWallet(token, 10_000);

      await waitForRoundStatus("RUNNING");

      const response = await placeBet(token, 1000);

      expect(response.status).toBe(422);
      expect((response.data as { error: string }).error).toBe("RoundNotInBettingPhaseError");
    },
    E2E_TEST_TIMEOUT_MS,
  );

  it(
    "rejects bet below minimum amount",
    async () => {
      const token = await getKeycloakToken();
      await setupWallet(token, 10_000);

      await waitForRoundStatus("BETTING");

      const response = await placeBet(token, 50);

      expect(response.status).toBe(400);
    },
    E2E_TEST_TIMEOUT_MS,
  );

  it(
    "rejects bet above maximum amount",
    async () => {
      const token = await getKeycloakToken();
      await setupWallet(token, 200_000);

      await waitForRoundStatus("BETTING");

      const response = await placeBet(token, 100_001);

      expect(response.status).toBe(422);
    },
    E2E_TEST_TIMEOUT_MS,
  );
});
