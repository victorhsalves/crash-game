import { ApiProperty } from "@nestjs/swagger";
import type { GetPlayerBetHistoryResult } from "../../application/use-cases/get-player-bet-history/get-player-bet-history.input";
import { BetResponseDto } from "./bet-response.dto";

export class PlayerBetHistoryResponseDto {
  @ApiProperty({ type: [BetResponseDto] })
  items!: BetResponseDto[];

  public static fromResult(result: GetPlayerBetHistoryResult): PlayerBetHistoryResponseDto {
    const dto = new PlayerBetHistoryResponseDto();
    dto.items = result.items.map((item) => {
      const entry = new BetResponseDto();
      entry.id = item.id;
      entry.playerId = item.playerId;
      entry.roundId = item.roundId;
      entry.amount = item.amount;
      entry.status = item.status;
      entry.createdAt = item.createdAt;
      entry.cashoutMultiplier = item.cashoutMultiplier;
      entry.payoutAmount = item.payoutAmount;
      entry.cashedOutAt = item.cashedOutAt;
      return entry;
    });
    return dto;
  }
}
