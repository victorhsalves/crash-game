import { Inject, Injectable, Logger } from "@nestjs/common";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { RoundWebSocketNotifier } from "../../../infrastructure/websocket/round-websocket.notifier";
import { GAME_ROUND_REPOSITORY } from "../../common/tokens";
import { GameRoundNotFoundError } from "../../errors/game-round-not-found.error";
import { OpenRoundBettingUseCase } from "../open-round-betting/open-round-betting.use-case";
import type { FinishRoundInput, FinishRoundResult } from "./finish-round.input";

@Injectable()
export class FinishRoundUseCase {
  private readonly logger = new Logger(FinishRoundUseCase.name);

  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
    private readonly openRoundBettingUseCase: OpenRoundBettingUseCase,
    private readonly roundWebSocketNotifier: RoundWebSocketNotifier,
  ) {}

  public async execute(input: FinishRoundInput): Promise<FinishRoundResult> {
    const round = await this.gameRoundRepository.findById(input.roundId);

    if (round === null) {
      throw GameRoundNotFoundError.create();
    }

    round.finish();
    await this.gameRoundRepository.save(round);
    await this.roundWebSocketNotifier.notifyFinished(round);

    const nextRound = await this.gameRoundRepository.findNextWaiting();

    if (nextRound === null) {
      this.logger.error(`No waiting round found after finishing ${round.id}`);
      return { finishedRoundId: round.id };
    }

    const opened = await this.openRoundBettingUseCase.execute({ roundId: nextRound.id });

    return {
      finishedRoundId: round.id,
      nextRoundId: opened.roundId,
      nextStatus: "BETTING",
      bettingEndsAt: opened.bettingEndsAt,
    };
  }
}
