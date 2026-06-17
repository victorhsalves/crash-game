import { EVENT_BROADCASTER, type EventBroadcaster } from "@crash/websocket";
import type { DebitFailureReason } from "@crash/messaging";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Bet } from "../../domain/entities/bet.entity";
import {
  WebSocketBetEvents,
  type BetAcceptedWebSocketPayload,
  type BetRejectedWebSocketPayload,
} from "./contracts/websocket-bet-events";

@Injectable()
export class BetWebSocketNotifier {
  private readonly logger = new Logger(BetWebSocketNotifier.name);

  public constructor(
    @Inject(EVENT_BROADCASTER)
    private readonly eventBroadcaster: EventBroadcaster,
  ) {}

  public async notifyAccepted(bet: Bet): Promise<void> {
    const socketId = bet.socketId;

    if (socketId === null || socketId.trim().length === 0) {
      this.logger.debug(`Bet ${bet.id} has no socketId; skipping bet.accepted emit`);
      return;
    }

    const payload: BetAcceptedWebSocketPayload = {
      betId: bet.id,
      status: "ACCEPTED",
    };

    await this.eventBroadcaster.emitTo(socketId, WebSocketBetEvents.Accepted, payload);
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
}
