import type { CashoutBetResult } from "../../application/use-cases/cashout-bet/cashout-bet.input";

export class CashoutBetResponseDto {
  betId!: string;
  roundId!: string;
  status!: "CASHED_OUT";
  multiplier!: number;
  payout!: number;
  cashedOutAt!: string;
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
