import { Inject, Injectable } from "@nestjs/common";
import { Bet } from "../../../domain/entities/bet.entity";
import type { BetRepository } from "../../../domain/repositories/bet.repository";
import { BET_REPOSITORY } from "../../common/tokens";
import { BetNotFoundError } from "../../errors/bet-not-found.error";
import type { GetBetByIdInput } from "./get-bet-by-id.input";

@Injectable()
export class GetBetByIdUseCase {
  public constructor(
    @Inject(BET_REPOSITORY)
    private readonly betRepository: BetRepository,
  ) {}

  public async execute(input: GetBetByIdInput): Promise<Bet> {
    const bet = await this.betRepository.findById(input.betId);

    if (bet === null || bet.playerId !== input.playerId) {
      throw BetNotFoundError.create();
    }

    return bet;
  }
}
