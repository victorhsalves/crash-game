import {
  BET_PLACED,
  createIntegrationEvent,
  createIntegrationEventEnvelope,
  EVENT_PUBLISHER,
  type EventPublisher,
} from "@crash/messaging";
import { Money } from "@crash/money";
import { Inject, Injectable } from "@nestjs/common";
import { Bet } from "../../../domain/entities/bet.entity";
import { RoundStatus } from "../../../domain/enums/round-status.enum";
import type { BetRepository } from "../../../domain/repositories/bet.repository";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { BET_REPOSITORY, GAME_ROUND_REPOSITORY } from "../../common/tokens";
import { BettingWindowClosedError } from "../../errors/betting-window-closed.error";
import { CurrentRoundNotFoundError } from "../../errors/current-round-not-found.error";
import { DuplicateBetError } from "../../errors/duplicate-bet.error";
import { RoundNotInBettingPhaseError } from "../../errors/round-not-in-betting-phase.error";
import type { PlaceBetInput, PlaceBetResult } from "./place-bet.input";

@Injectable()
export class PlaceBetUseCase {
  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
    @Inject(BET_REPOSITORY)
    private readonly betRepository: BetRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: EventPublisher,
  ) {}

  public async execute(input: PlaceBetInput): Promise<PlaceBetResult> {
    const round = await this.gameRoundRepository.findCurrent();

    if (round === null) {
      throw CurrentRoundNotFoundError.create();
    }

    if (round.status !== RoundStatus.Betting) {
      throw RoundNotInBettingPhaseError.create();
    }

    if (round.bettingEndsAt !== null && new Date() >= round.bettingEndsAt) {
      throw BettingWindowClosedError.create();
    }

    const existingBet = await this.betRepository.findByPlayerIdAndRoundId(
      input.playerId,
      round.id,
    );

    if (existingBet !== null) {
      throw DuplicateBetError.create();
    }

    const { bet } = Bet.place({
      id: crypto.randomUUID(),
      playerId: input.playerId,
      roundId: round.id,
      amount: Money.fromCents(BigInt(input.amountCents)),
      socketId: input.socketId ?? null,
    });

    await this.betRepository.save(bet);

    const event = createIntegrationEvent({
      eventType: BET_PLACED,
      aggregateId: bet.id,
      payload: {
        betId: bet.id,
        playerId: bet.playerId,
        roundId: bet.roundId,
        amount: bet.amount.value.toString(),
      },
    });

    await this.eventPublisher.publish(BET_PLACED, createIntegrationEventEnvelope(event));

    return {
      betId: bet.id,
      status: "PENDING",
    };
  }
}
