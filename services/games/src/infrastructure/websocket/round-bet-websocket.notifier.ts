import { EVENT_BROADCASTER, type EventBroadcaster } from "@crash/websocket";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Bet } from "../../domain/entities/bet.entity";
import { RoundStatus } from "../../domain/enums/round-status.enum";
import { RoundBetPublicDto } from "../../presentation/dtos/round-bet-public.dto";
import {
  WebSocketRoundBetEvents,
  type RoundBetAddedWebSocketPayload,
  type RoundBetUpdatedWebSocketPayload,
} from "./contracts/websocket-round-bet-events";

@Injectable()
export class RoundBetWebSocketNotifier {
  private readonly logger = new Logger(RoundBetWebSocketNotifier.name);

  public constructor(
    @Inject(EVENT_BROADCASTER)
    private readonly eventBroadcaster: EventBroadcaster,
  ) {}

  public async notifyAdded(bet: Bet, roundStatus: RoundStatus): Promise<void> {
    const publicBet = RoundBetPublicDto.fromDomain(bet, roundStatus);

    if (publicBet === null) {
      this.logger.debug(`Bet ${bet.id} is not public for round status ${roundStatus}; skipping round.bet-added`);
      return;
    }

    const payload: RoundBetAddedWebSocketPayload = {
      roundId: bet.roundId,
      bet: {
        id: publicBet.id,
        username: publicBet.username,
        amountCents: publicBet.amountCents,
        status: publicBet.status,
        multiplier: publicBet.multiplier,
        payoutCents: publicBet.payoutCents,
        cashedOutAt: publicBet.cashedOutAt,
      },
    };

    await this.eventBroadcaster.broadcast(WebSocketRoundBetEvents.Added, payload);
  }

  public async notifyUpdated(bet: Bet, roundStatus: RoundStatus): Promise<void> {
    const publicBet = RoundBetPublicDto.fromDomain(bet, roundStatus);

    if (publicBet === null) {
      this.logger.debug(`Bet ${bet.id} is not public for round status ${roundStatus}; skipping round.bet-updated`);
      return;
    }

    const payload: RoundBetUpdatedWebSocketPayload = {
      roundId: bet.roundId,
      betId: publicBet.id,
      status: publicBet.status,
      multiplier: publicBet.multiplier,
      payoutCents: publicBet.payoutCents,
      cashedOutAt: publicBet.cashedOutAt,
    };

    await this.eventBroadcaster.broadcast(WebSocketRoundBetEvents.Updated, payload);
  }
}
