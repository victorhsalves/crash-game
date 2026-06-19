import { EVENT_BROADCASTER, type EventBroadcaster } from "@crash/websocket";
import type { DebitFailureReason } from "@crash/messaging";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { CashoutBetResult } from "../../application/use-cases/cashout-bet/cashout-bet.input";
import type { Bet } from "../../domain/entities/bet.entity";
import { RoundStatus } from "../../domain/enums/round-status.enum";
import type { BetRepository } from "../../domain/repositories/bet.repository";
import type { GameRoundRepository } from "../../domain/repositories/game-round.repository";
import { BET_REPOSITORY, GAME_ROUND_REPOSITORY } from "../../application/common/tokens";
import {
  WebSocketBetEvents,
  type BetAcceptedWebSocketPayload,
  type BetRejectedWebSocketPayload,
  type BetUpdatedWebSocketPayload,
} from "./contracts/websocket-bet-events";
import { RoundBetWebSocketNotifier } from "./round-bet-websocket.notifier";

@Injectable()
export class BetWebSocketNotifier {
  private readonly logger = new Logger(BetWebSocketNotifier.name);

  public constructor(
    @Inject(EVENT_BROADCASTER)
    private readonly eventBroadcaster: EventBroadcaster,
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
    @Inject(BET_REPOSITORY)
    private readonly betRepository: BetRepository,
    private readonly roundBetWebSocketNotifier: RoundBetWebSocketNotifier,
  ) {}

  public async notifyAccepted(bet: Bet): Promise<void> {
    const socketId = bet.socketId;

    if (socketId === null || socketId.trim().length === 0) {
      this.logger.debug(`Bet ${bet.id} has no socketId; skipping bet.accepted emit`);
    } else {
      const payload: BetAcceptedWebSocketPayload = {
        betId: bet.id,
        status: "ACCEPTED",
      };

      await this.eventBroadcaster.emitTo(socketId, WebSocketBetEvents.Accepted, payload);
    }

    const roundStatus = await this.resolveRoundStatus(bet.roundId);
    if (roundStatus !== null) {
      await this.roundBetWebSocketNotifier.notifyAdded(bet, roundStatus);
    }
  }

  public async notifyRejected(bet: Bet, reason: DebitFailureReason): Promise<void> {
    const socketId = bet.socketId;

    if (socketId === null || socketId.trim().length === 0) {
      this.logger.debug(`Bet ${bet.id} has no socketId; skipping bet.rejected emit`);
      return;
    }

    const payload: BetRejectedWebSocketPayload = {
      betId: bet.id,
      status: "REJECTED",
      reason,
    };

    await this.eventBroadcaster.emitTo(socketId, WebSocketBetEvents.Rejected, payload);
  }

  public async notifyCashedOut(result: CashoutBetResult): Promise<void> {
    if (result.alreadyCashedOut) {
      return;
    }

    const socketId = result.socketId;

    if (socketId === null || socketId.trim().length === 0) {
      this.logger.debug(`Bet ${result.betId} has no socketId; skipping bet.updated CASHED_OUT emit`);
    } else {
      const payload: BetUpdatedWebSocketPayload = {
        betId: result.betId,
        userId: result.userId,
        roundId: result.roundId,
        status: "CASHED_OUT",
        multiplier: result.multiplier,
        payout: result.payout,
        cashedOutAt: result.cashedOutAt.toISOString(),
      };

      await this.eventBroadcaster.emitTo(socketId, WebSocketBetEvents.Updated, payload);
    }

    const bet = await this.betRepository.findById(result.betId);
    const roundStatus = await this.resolveRoundStatus(result.roundId);

    if (bet !== null && roundStatus !== null) {
      await this.roundBetWebSocketNotifier.notifyUpdated(bet, roundStatus);
    }
  }

  public async notifyUpdatedLost(bet: Bet): Promise<void> {
    const socketId = bet.socketId;

    if (socketId === null || socketId.trim().length === 0) {
      this.logger.debug(`Bet ${bet.id} has no socketId; skipping bet.updated LOST emit`);
    } else {
      const payload: BetUpdatedWebSocketPayload = {
        betId: bet.id,
        userId: bet.playerId,
        roundId: bet.roundId,
        status: "LOST",
        multiplier: null,
        payout: null,
        cashedOutAt: null,
      };

      await this.eventBroadcaster.emitTo(socketId, WebSocketBetEvents.Updated, payload);
    }

    const roundStatus = await this.resolveRoundStatus(bet.roundId);
    if (roundStatus !== null) {
      await this.roundBetWebSocketNotifier.notifyUpdated(bet, roundStatus);
    }
  }

  public async notifyWalletCredited(bet: Bet): Promise<void> {
    const socketId = bet.socketId;

    if (socketId === null || socketId.trim().length === 0) {
      this.logger.debug(`Bet ${bet.id} has no socketId; skipping wallet credited emit`);
      return;
    }

    if (bet.cashoutMultiplier === null || bet.payoutAmount === null || bet.cashedOutAt === null) {
      this.logger.debug(`Bet ${bet.id} is missing cashout details; skipping wallet credited emit`);
      return;
    }

    const payload: BetUpdatedWebSocketPayload = {
      betId: bet.id,
      userId: bet.playerId,
      roundId: bet.roundId,
      status: "CASHED_OUT",
      multiplier: bet.cashoutMultiplier.value,
      payout: Number(bet.payoutAmount.value) / 100,
      cashedOutAt: bet.cashedOutAt.toISOString(),
      walletCredited: true,
    };

    await this.eventBroadcaster.emitTo(socketId, WebSocketBetEvents.Updated, payload);
  }

  private async resolveRoundStatus(roundId: string): Promise<RoundStatus | null> {
    const round = await this.gameRoundRepository.findById(roundId);
    return round?.status ?? null;
  }
}
