import { Inject, Injectable } from "@nestjs/common";
import { GameRound } from "../../../domain/entities/game-round.entity";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { GAME_ROUND_REPOSITORY } from "../../common/tokens";
import type { CreateGameRoundResult } from "./create-game-round.input";

@Injectable()
export class CreateGameRoundUseCase {
  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
  ) {}

  public async execute(): Promise<CreateGameRoundResult> {
    const round = GameRound.create({ id: crypto.randomUUID() });

    await this.gameRoundRepository.save(round);

    return {
      roundId: round.id,
      status: "WAITING",
    };
  }
}
