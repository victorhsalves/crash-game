import {
  BET_CASHED_OUT,
  createIntegrationEvent,
  createIntegrationEventEnvelope,
  EVENT_PUBLISHER,
  type EventPublisher,
} from "@crash/messaging";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Bet } from "../../../domain/entities/bet.entity";
import { BetStatus } from "../../../domain/enums/bet-status.enum";
import { RoundStatus } from "../../../domain/enums/round-status.enum";
import type { Clock } from "../../../domain/ports/clock.port";
import type { BetRepository } from "../../../domain/repositories/bet.repository";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { BetWebSocketNotifier } from "../../../infrastructure/websocket/bet-websocket.notifier";
import { BET_REPOSITORY, CLOCK, GAME_ROUND_REPOSITORY } from "../../common/tokens";
import { GameRoundNotFoundError } from "../../errors/game-round-not-found.error";
import type { SettleRoundBetsInput } from "./settle-round-bets.input";

@Injectable()
export class SettleRoundBetsUseCase {
  private readonly logger = new Logger(SettleRoundBetsUseCase.name);

  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
    @Inject(BET_REPOSITORY)
    private readonly betRepository: BetRepository,
    @Inject(CLOCK)
    private readonly clock: Clock,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: EventPublisher,
    private readonly betWebSocketNotifier: BetWebSocketNotifier,
  ) {}

  public async execute(input: SettleRoundBetsInput): Promise<void> {
    const round = await this.gameRoundRepository.findById(input.roundId);

    if (round === null) {
      throw GameRoundNotFoundError.create();
    }

    if (round.status !== RoundStatus.Crashed && round.status !== RoundStatus.Finished) {
      this.logger.warn(
        `Skipping settlement for roundId=${round.id} with status=${round.status}`,
      );
      return;
    }

    if (round.settledAt !== null) {
      return;
    }

    const bets = await this.betRepository.findByRoundId(round.id);
    let hasFailures = false;
    const lostBets: Bet[] = [];

    for (const bet of bets) {
      try {
        const lostBet = await this.betRepository.runInTransaction(async (scope) => {
          const lockedBet = await scope.findByIdForUpdate(bet.id);

          if (lockedBet === null) {
            return null;
          }

          if (lockedBet.status === BetStatus.Accepted) {
            lockedBet.lose(this.clock.now());
            await scope.save(lockedBet);
            return lockedBet;
          }

          if (lockedBet.status === BetStatus.CashedOut) {
            if (lockedBet.payoutAmount === null || lockedBet.cashoutMultiplier === null) {
              this.logger.error(
                `Cashed out bet ${lockedBet.id} is missing payout details; skipping credit publish.`,
              );
              hasFailures = true;
              return null;
            }

            if (lockedBet.payoutPublishedAt !== null) {
              return null;
            }

            await this.publishBetCashedOut(lockedBet);
            lockedBet.markPayoutPublished(this.clock.now());
            await scope.save(lockedBet);
          }

          return null;
        });

        if (lostBet !== null) {
          lostBets.push(lostBet);
        }
      } catch (error) {
        hasFailures = true;
        this.logger.error(
          `Failed to settle betId=${bet.id} for roundId=${round.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    for (const lostBet of lostBets) {
      try {
        await this.betWebSocketNotifier.notifyUpdatedLost(lostBet);
      } catch (error) {
        hasFailures = true;
        this.logger.error(
          `Failed to notify LOST for betId=${lostBet.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    if (!hasFailures) {
      round.markSettled(this.clock.now());
      await this.gameRoundRepository.save(round);
    }
  }

  private async publishBetCashedOut(bet: Bet): Promise<void> {
    if (bet.payoutAmount === null || bet.cashoutMultiplier === null) {
      throw new Error(`Bet ${bet.id} is missing cashout details for payout publish.`);
    }

    const event = createIntegrationEvent({
      eventType: BET_CASHED_OUT,
      aggregateId: bet.id,
      payload: {
        betId: bet.id,
        playerId: bet.playerId,
        roundId: bet.roundId,
        payoutAmount: bet.payoutAmount.value.toString(),
        cashoutMultiplier: bet.cashoutMultiplier.value,
      },
    });

    await this.eventPublisher.publish(BET_CASHED_OUT, createIntegrationEventEnvelope(event));
  }
}
