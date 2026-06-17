import { Inject, Injectable } from "@nestjs/common";
import { RoundStatus } from "../../../domain/enums/round-status.enum";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { GAME_ROUND_REPOSITORY } from "../../common/tokens";
import { CrashRoundUseCase } from "../crash-round/crash-round.use-case";
import { CreateGameRoundUseCase } from "../create-game-round/create-game-round.use-case";
import { EnsureNextRoundWaitingUseCase } from "../ensure-next-round-waiting/ensure-next-round-waiting.use-case";
import { FinishRoundUseCase } from "../finish-round/finish-round.use-case";
import { OpenRoundBettingUseCase } from "../open-round-betting/open-round-betting.use-case";
import { StartRoundUseCase } from "../start-round/start-round.use-case";
import type {
  RecoverRoundLifecycleInput,
  RecoverRoundLifecycleResult,
  ScheduledTimer,
} from "./recover-round-lifecycle.input";

@Injectable()
export class RecoverRoundLifecycleUseCase {
  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
    private readonly createGameRoundUseCase: CreateGameRoundUseCase,
    private readonly openRoundBettingUseCase: OpenRoundBettingUseCase,
    private readonly startRoundUseCase: StartRoundUseCase,
    private readonly crashRoundUseCase: CrashRoundUseCase,
    private readonly finishRoundUseCase: FinishRoundUseCase,
    private readonly ensureNextRoundWaitingUseCase: EnsureNextRoundWaitingUseCase,
  ) {}

  public async execute(input: RecoverRoundLifecycleInput): Promise<RecoverRoundLifecycleResult> {
    const now = Date.now();
    const timers: ScheduledTimer[] = [];
    let action: RecoverRoundLifecycleResult["action"] = "resumed";

    const current = await this.gameRoundRepository.findCurrent();

    if (current !== null) {
      if (current.status === RoundStatus.Betting) {
        const bettingEndsAt = current.bettingEndsAt!.getTime();

        if (now >= bettingEndsAt) {
          action = "caught-up";
          const started = await this.startRoundUseCase.execute({ roundId: current.id });
          timers.push({ type: "crash-at", roundId: started.roundId, at: started.crashAt });
        } else {
          timers.push({ type: "betting-end", roundId: current.id, at: current.bettingEndsAt! });
        }

        return { action, timers };
      }

      if (current.status === RoundStatus.Running) {
        const crashAt = current.crashAt;

        if (crashAt === null || now >= crashAt.getTime()) {
          action = "caught-up";
          const crashed = await this.crashRoundUseCase.execute({ roundId: current.id });
          timers.push({ type: "crashed-end", roundId: crashed.roundId, at: crashed.crashedEndsAt });
        } else {
          timers.push({ type: "crash-at", roundId: current.id, at: crashAt });
        }

        return { action, timers };
      }

      if (current.status === RoundStatus.Crashed) {
        const crashedEndsAt = new Date(current.crashedAt!.getTime() + input.crashedDurationMs);

        await this.ensureNextRoundWaitingUseCase.execute();

        if (now >= crashedEndsAt.getTime()) {
          action = "caught-up";
          const finished = await this.finishRoundUseCase.execute({ roundId: current.id });

          if (finished.nextRoundId !== undefined && finished.bettingEndsAt !== undefined) {
            timers.push({
              type: "betting-end",
              roundId: finished.nextRoundId,
              at: finished.bettingEndsAt,
            });
          }
        } else {
          timers.push({ type: "crashed-end", roundId: current.id, at: crashedEndsAt });
        }

        return { action, timers };
      }
    }

    const waiting = await this.gameRoundRepository.findNextWaiting();

    if (waiting !== null) {
      action = action === "resumed" ? "caught-up" : action;
      const opened = await this.openRoundBettingUseCase.execute({
        roundId: waiting.id,
        durationMs: input.bettingDurationMs,
      });
      timers.push({ type: "betting-end", roundId: opened.roundId, at: opened.bettingEndsAt });

      return { action: "started", timers };
    }

    const created = await this.createGameRoundUseCase.execute();
    const opened = await this.openRoundBettingUseCase.execute({
      roundId: created.roundId,
      durationMs: input.bettingDurationMs,
    });
    timers.push({ type: "betting-end", roundId: opened.roundId, at: opened.bettingEndsAt });

    return { action: "started", timers };
  }
}
