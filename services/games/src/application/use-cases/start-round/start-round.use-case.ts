import { Inject, Injectable } from "@nestjs/common";
import type { CrashPointGenerator } from "../../../domain/ports/crash-point-generator.port";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import type { CrashCurve } from "../../../domain/services/crash-curve";
import { RoundWebSocketNotifier } from "../../../infrastructure/websocket/round-websocket.notifier";
import { CURVE_GROWTH_FACTOR } from "../../common/round-lifecycle.constants";
import { CRASH_CURVE, CRASH_POINT_GENERATOR, GAME_ROUND_REPOSITORY } from "../../common/tokens";
import { GameRoundNotFoundError } from "../../errors/game-round-not-found.error";
import type { StartRoundInput, StartRoundResult } from "./start-round.input";

@Injectable()
export class StartRoundUseCase {
  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
    @Inject(CRASH_POINT_GENERATOR)
    private readonly crashPointGenerator: CrashPointGenerator,
    @Inject(CRASH_CURVE)
    private readonly crashCurve: CrashCurve,
    private readonly roundWebSocketNotifier: RoundWebSocketNotifier,
  ) {}

  public async execute(input: StartRoundInput): Promise<StartRoundResult> {
    const round = await this.gameRoundRepository.findById(input.roundId);

    if (round === null) {
      throw GameRoundNotFoundError.create();
    }

    const crashPoint = this.crashPointGenerator.generate();

    round.start(crashPoint, this.crashCurve);
    await this.gameRoundRepository.save(round);

    const startedAt = round.startedAt!;
    const crashAt = round.crashAt!;

    await this.roundWebSocketNotifier.notifyRunning(round, CURVE_GROWTH_FACTOR);

    return {
      roundId: round.id,
      status: "RUNNING",
      startedAt,
      crashAt,
    };
  }
}
