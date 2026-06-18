import type { GetRoundHistoryResult } from "../../application/use-cases/get-round-history/get-round-history.input";

export class RoundHistoryItemDto {
  id!: string;
  crashPoint!: string;
  crashedAt!: string;
  serverSeedHash!: string;
}

export class RoundHistoryResponseDto {
  items!: RoundHistoryItemDto[];

  public static fromResult(result: GetRoundHistoryResult): RoundHistoryResponseDto {
    const dto = new RoundHistoryResponseDto();
    dto.items = result.items.map((item) => {
      const entry = new RoundHistoryItemDto();
      entry.id = item.id;
      entry.crashPoint = item.crashPoint;
      entry.crashedAt = item.crashedAt;
      entry.serverSeedHash = item.serverSeedHash;
      return entry;
    });
    return dto;
  }
}
