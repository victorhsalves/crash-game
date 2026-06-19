import { Inject, Injectable } from "@nestjs/common";
import { Bet } from "../../../domain/entities/bet.entity";
import { BetStatus } from "../../../domain/enums/bet-status.enum";
import { RoundStatus } from "../../../domain/enums/round-status.enum";
import type { Clock } from "../../../domain/ports/clock.port";
import type { BetRepository } from "../../../domain/repositories/bet.repository";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import type { CrashCurve } from "../../../domain/services/crash-curve";
import { Multiplier } from "../../../domain/value-objects/multiplier.value-object";
import { BET_REPOSITORY, CLOCK, CRASH_CURVE, GAME_ROUND_REPOSITORY } from "../../common/tokens";
import { BetAlreadySettledError } from "../../errors/bet-already-settled.error";
import { BetNotAcceptedError } from "../../errors/bet-not-accepted.error";
import { BetNotFoundError } from "../../errors/bet-not-found.error";
import { RoundAlreadyCrashedError } from "../../errors/round-already-crashed.error";
import { RoundNotRunningError } from "../../errors/round-not-running.error";
import type { CashoutBetInput, CashoutBetResult } from "./cashout-bet.input";

@Injectable()
export class CashoutBetUseCase {
  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
    @Inject(BET_REPOSITORY)
    private readonly betRepository: BetRepository,
    @Inject(CRASH_CURVE)
    private readonly crashCurve: CrashCurve,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  public async execute(input: CashoutBetInput): Promise<CashoutBetResult> {
    const now = this.clock.now();
    const round = await this.gameRoundRepository.findCurrent();

    if (
      round === null ||
      round.status !== RoundStatus.Running ||
      round.startedAt === null ||
      round.crashAt === null ||
      round.crashPoint === null
    ) {
      throw RoundNotRunningError.create();
    }

    if (now.getTime() >= round.crashAt.getTime()) {
      throw RoundAlreadyCrashedError.create();
    }

    const bet = await this.betRepository.findByPlayerIdAndRoundId(input.playerId, round.id);

    if (bet === null) {
      throw BetNotFoundError.create();
    }

    if (bet.status === BetStatus.CashedOut) {
      return this.toResult(bet, true);
    }

    if (bet.status === BetStatus.Pending) {
      throw BetNotAcceptedError.create();
    }

    if (bet.status === BetStatus.Rejected || bet.status === BetStatus.Lost) {
      throw BetAlreadySettledError.create();
    }

    const elapsedSeconds = (now.getTime() - round.startedAt.getTime()) / 1000;
    const calculatedMultiplier = this.crashCurve.calculateMultiplier(elapsedSeconds);
    const safeMultiplier = Math.min(calculatedMultiplier, round.crashPoint.value);
    const multiplier = Multiplier.fromValue(safeMultiplier);

    return this.betRepository.runInTransaction(async (scope) => {
      const lockedBet = await scope.findByIdForUpdate(bet.id);

      if (lockedBet === null) {
        throw BetNotFoundError.create();
      }

      if (lockedBet.status === BetStatus.CashedOut) {
        return this.toResult(lockedBet, true);
      }

      lockedBet.cashout(multiplier, now);
      await scope.save(lockedBet);

      return this.toResult(lockedBet, false);
    });
  }

  private toResult(bet: Bet, alreadyCashedOut: boolean): CashoutBetResult {
    if (bet.cashoutMultiplier === null || bet.payoutAmount === null || bet.cashedOutAt === null) {
      throw BetNotFoundError.create();
    }

    return {
      betId: bet.id,
      userId: bet.playerId,
      roundId: bet.roundId,
      multiplier: bet.cashoutMultiplier.value,
      payout: Number(bet.payoutAmount.value) / 100,
      cashedOutAt: bet.cashedOutAt,
      socketId: bet.socketId,
      alreadyCashedOut,
    };
  }
}
