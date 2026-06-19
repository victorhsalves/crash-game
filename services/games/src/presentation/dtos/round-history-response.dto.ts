import { ApiProperty } from "@nestjs/swagger";
import type { GetRoundHistoryResult } from "../../application/use-cases/get-round-history/get-round-history.input";

export class RoundHistoryItemDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "2.34" })
  crashPoint!: string;

  @ApiProperty({ format: "date-time" })
  crashedAt!: string;

  @ApiProperty()
  serverSeedHash!: string;
}

export class RoundHistoryResponseDto {
  @ApiProperty({ type: [RoundHistoryItemDto] })
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
