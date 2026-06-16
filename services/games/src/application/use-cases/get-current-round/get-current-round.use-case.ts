import { Inject, Injectable } from "@nestjs/common";
import { GameRound } from "../../../domain/entities/game-round.entity";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { CurrentRoundNotFoundError } from "../../errors/current-round-not-found.error";
import { GAME_ROUND_REPOSITORY } from "../../common/tokens";

@Injectable()
export class GetCurrentRoundUseCase {
  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
  ) {}

  public async execute(): Promise<GameRound> {
    const round = await this.gameRoundRepository.findCurrent();

    if (round === null) {
      throw CurrentRoundNotFoundError.create();
    }

    return round;
  }
}
