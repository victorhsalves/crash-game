import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  ROUND_BETTING_DURATION_MS,
  ROUND_CRASHED_DURATION_MS,
} from "../../application/common/round-lifecycle.constants";
import { CrashRoundUseCase } from "../../application/use-cases/crash-round/crash-round.use-case";
import { FinishRoundUseCase } from "../../application/use-cases/finish-round/finish-round.use-case";
import { RecoverRoundLifecycleUseCase } from "../../application/use-cases/recover-round-lifecycle/recover-round-lifecycle.use-case";
import type { ScheduledTimer } from "../../application/use-cases/recover-round-lifecycle/recover-round-lifecycle.input";
import { StartRoundUseCase } from "../../application/use-cases/start-round/start-round.use-case";

@Injectable()
export class RoundLifecycleScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoundLifecycleScheduler.name);
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private isTransitioning = false;

  public constructor(
    private readonly recoverRoundLifecycleUseCase: RecoverRoundLifecycleUseCase,
    private readonly startRoundUseCase: StartRoundUseCase,
    private readonly crashRoundUseCase: CrashRoundUseCase,
    private readonly finishRoundUseCase: FinishRoundUseCase,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    this.logger.log("Recovering round lifecycle state");

    const recovery = await this.recoverRoundLifecycleUseCase.execute({
      bettingDurationMs: ROUND_BETTING_DURATION_MS,
      crashedDurationMs: ROUND_CRASHED_DURATION_MS,
    });

    this.logger.log(`Round lifecycle recovery action: ${recovery.action}`);

    for (const timer of recovery.timers) {
      this.scheduleTimer(timer);
    }
  }

  private scheduleTimer(timer: ScheduledTimer): void {
    const delayMs = Math.max(0, timer.at.getTime() - Date.now());
    const key = `${timer.type}:${timer.roundId}`;

    const existing = this.timers.get(key);
    if (existing !== undefined) {
      clearTimeout(existing);
    }

    const timeout = setTimeout(() => {
      void this.handleTimer(timer);
    }, delayMs);

    this.timers.set(key, timeout);
  }

  private async handleTimer(timer: ScheduledTimer): Promise<void> {
    this.timers.delete(`${timer.type}:${timer.roundId}`);

    if (this.isTransitioning) {
      return;
    }

    this.isTransitioning = true;

    try {
      if (timer.type === "betting-end") {
        await this.onBettingExpired(timer.roundId);
      } else if (timer.type === "crash-at") {
        await this.onCrashAt(timer.roundId);
      } else {
        await this.onCrashedEnd(timer.roundId);
      }
    } catch (error) {
      this.logger.error(`Round lifecycle transition failed for ${timer.type} on ${timer.roundId}`, error);
    } finally {
      this.isTransitioning = false;
    }
  }

  private async onBettingExpired(roundId: string): Promise<void> {
    const result = await this.startRoundUseCase.execute({ roundId });
    this.scheduleTimer({ type: "crash-at", roundId: result.roundId, at: result.crashAt });
  }

  private async onCrashAt(roundId: string): Promise<void> {
    const result = await this.crashRoundUseCase.execute({ roundId });
    this.scheduleTimer({ type: "crashed-end", roundId: result.roundId, at: result.crashedEndsAt });
  }

  private async onCrashedEnd(roundId: string): Promise<void> {
    const result = await this.finishRoundUseCase.execute({ roundId });

    if (result.nextRoundId !== undefined && result.bettingEndsAt !== undefined) {
      this.scheduleTimer({
        type: "betting-end",
        roundId: result.nextRoundId,
        at: result.bettingEndsAt,
      });
    }
  }
}
