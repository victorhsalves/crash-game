import { ApiProperty } from "@nestjs/swagger";
import type { CashoutBetResult } from "../../application/use-cases/cashout-bet/cashout-bet.input";

export class CashoutBetResponseDto {
  @ApiProperty({ format: "uuid" })
  betId!: string;

  @ApiProperty({ format: "uuid" })
  roundId!: string;

  @ApiProperty({ example: "CASHED_OUT" })
  status!: "CASHED_OUT";

  @ApiProperty({ example: 2.5 })
  multiplier!: number;

  @ApiProperty({ example: 25.0 })
  payout!: number;

  @ApiProperty({ format: "date-time" })
  cashedOutAt!: string;

  @ApiProperty({ example: false })
  alreadyCashedOut!: boolean;

  public static fromResult(result: CashoutBetResult): CashoutBetResponseDto {
    const dto = new CashoutBetResponseDto();

    dto.betId = result.betId;
    dto.roundId = result.roundId;
    dto.status = "CASHED_OUT";
    dto.multiplier = result.multiplier;
    dto.payout = result.payout;
    dto.cashedOutAt = result.cashedOutAt.toISOString();
    dto.alreadyCashedOut = result.alreadyCashedOut ?? false;

    return dto;
  }
}
