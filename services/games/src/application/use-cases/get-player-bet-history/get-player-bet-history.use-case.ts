import { Inject, Injectable } from "@nestjs/common";
import type { Bet } from "../../../domain/entities/bet.entity";
import type { BetRepository } from "../../../domain/repositories/bet.repository";
import { BET_REPOSITORY } from "../../common/tokens";
import type {
  GetPlayerBetHistoryInput,
  GetPlayerBetHistoryResult,
  PlayerBetHistoryEntry,
} from "./get-player-bet-history.input";

function formatAmount(cents: bigint): string {
  return (Number(cents) / 100).toFixed(2);
}

function mapBetToEntry(bet: Bet): PlayerBetHistoryEntry {
  return {
    id: bet.id,
    playerId: bet.playerId,
    roundId: bet.roundId,
    amount: formatAmount(bet.amount.value),
    status: bet.status,
    createdAt: bet.createdAt.toISOString(),
    cashoutMultiplier:
      bet.cashoutMultiplier !== null ? bet.cashoutMultiplier.value.toFixed(2) : null,
    payoutAmount: bet.payoutAmount !== null ? formatAmount(bet.payoutAmount.value) : null,
    cashedOutAt: bet.cashedOutAt !== null ? bet.cashedOutAt.toISOString() : null,
  };
}

@Injectable()
export class GetPlayerBetHistoryUseCase {
  private static readonly DefaultLimit = 20;

  public constructor(
    @Inject(BET_REPOSITORY)
    private readonly betRepository: BetRepository,
  ) {}

  public async execute(input: GetPlayerBetHistoryInput): Promise<GetPlayerBetHistoryResult> {
    const limit = input.limit ?? GetPlayerBetHistoryUseCase.DefaultLimit;
    const offset = input.offset ?? 0;
    const bets = await this.betRepository.findByPlayerIdPaginated(input.playerId, limit, offset);

    return {
      items: bets.map(mapBetToEntry),
    };
  }
}
