import { Inject, Injectable, Logger } from "@nestjs/common";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { RoundWebSocketNotifier } from "../../../infrastructure/websocket/round-websocket.notifier";
import { ROUND_CRASHED_DURATION_MS } from "../../common/round-lifecycle.constants";
import { GAME_ROUND_REPOSITORY } from "../../common/tokens";
import { GameRoundNotFoundError } from "../../errors/game-round-not-found.error";
import { EnsureNextRoundWaitingUseCase } from "../ensure-next-round-waiting/ensure-next-round-waiting.use-case";
import { SettleRoundBetsUseCase } from "../settle-round-bets/settle-round-bets.use-case";
import type { CrashRoundInput, CrashRoundResult } from "./crash-round.input";

@Injectable()
export class CrashRoundUseCase {
  private readonly logger = new Logger(CrashRoundUseCase.name);

  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
    private readonly ensureNextRoundWaitingUseCase: EnsureNextRoundWaitingUseCase,
    private readonly roundWebSocketNotifier: RoundWebSocketNotifier,
    private readonly settleRoundBetsUseCase: SettleRoundBetsUseCase,
  ) {}

  public async execute(input: CrashRoundInput): Promise<CrashRoundResult> {
    const round = await this.gameRoundRepository.findById(input.roundId);

    if (round === null) {
      throw GameRoundNotFoundError.create();
    }

    round.crash();
    await this.gameRoundRepository.save(round);

    try {
      await this.settleRoundBetsUseCase.execute({ roundId: round.id });
    } catch (error) {
      this.logger.error(
        `Settlement failed for roundId=${round.id} after crash`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    await this.roundWebSocketNotifier.notifyCrashed(round);
    await this.ensureNextRoundWaitingUseCase.execute();

    const crashedAt = round.crashedAt!;
    const crashedEndsAt = new Date(crashedAt.getTime() + ROUND_CRASHED_DURATION_MS);

    return {
      roundId: round.id,
      crashedAt,
      crashedEndsAt,
    };
  }
}
