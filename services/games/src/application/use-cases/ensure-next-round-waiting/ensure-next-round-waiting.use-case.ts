import { Inject, Injectable } from "@nestjs/common";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { GAME_ROUND_REPOSITORY } from "../../common/tokens";
import { CreateGameRoundUseCase } from "../create-game-round/create-game-round.use-case";
import type { EnsureNextRoundWaitingResult } from "./ensure-next-round-waiting.input";

@Injectable()
export class EnsureNextRoundWaitingUseCase {
  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
    private readonly createGameRoundUseCase: CreateGameRoundUseCase,
  ) {}

  public async execute(): Promise<EnsureNextRoundWaitingResult> {
    const existing = await this.gameRoundRepository.findNextWaiting();

    if (existing !== null) {
      return { nextRoundId: existing.id };
    }

    const created = await this.createGameRoundUseCase.execute();

    return { nextRoundId: created.roundId };
  }
}
