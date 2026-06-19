import { Inject, Injectable } from "@nestjs/common";
import type { BetRepository } from "../../../domain/repositories/bet.repository";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { CurrentRoundNotFoundError } from "../../errors/current-round-not-found.error";
import { BET_REPOSITORY, GAME_ROUND_REPOSITORY } from "../../common/tokens";
import type { GetCurrentRoundResult } from "./get-current-round.result";

@Injectable()
export class GetCurrentRoundUseCase {
  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
    @Inject(BET_REPOSITORY)
    private readonly betRepository: BetRepository,
  ) {}

  public async execute(): Promise<GetCurrentRoundResult> {
    const round = await this.gameRoundRepository.findCurrent();

    if (round === null) {
      throw CurrentRoundNotFoundError.create();
    }

    const bets = await this.betRepository.findByRoundId(round.id);

    return { round, bets };
  }
}
