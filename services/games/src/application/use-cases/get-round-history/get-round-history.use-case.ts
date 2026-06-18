import { Inject, Injectable } from "@nestjs/common";
import type { GameRoundRepository } from "../../../domain/repositories/game-round.repository";
import { GAME_ROUND_REPOSITORY } from "../../common/tokens";
import type { GetRoundHistoryInput, GetRoundHistoryResult } from "./get-round-history.input";

@Injectable()
export class GetRoundHistoryUseCase {
  private static readonly DefaultLimit = 20;

  public constructor(
    @Inject(GAME_ROUND_REPOSITORY)
    private readonly gameRoundRepository: GameRoundRepository,
  ) {}

  public async execute(input: GetRoundHistoryInput = {}): Promise<GetRoundHistoryResult> {
    const limit = input.limit ?? GetRoundHistoryUseCase.DefaultLimit;
    const offset = input.offset ?? 0;
    const history = await this.gameRoundRepository.findHistory(limit, offset);

    return {
      items: history.map((item) => ({
        id: item.id,
        crashPoint: (item.crashPointBasisPoints / 100).toFixed(2),
        crashedAt: item.crashedAt.toISOString(),
        serverSeedHash: item.serverSeedHash,
      })),
    };
  }
}
