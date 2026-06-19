import { Bet } from "../../domain/entities/bet.entity";
import { BetStatus } from "../../domain/enums/bet-status.enum";

function formatAmount(cents: bigint): string {
  return (Number(cents) / 100).toFixed(2);
}

export class BetResponseDto {
  id!: string;
  playerId!: string;
  roundId!: string;
  amount!: string;
  status!: BetStatus;
  createdAt!: string;
  cashoutMultiplier!: string | null;
  payoutAmount!: string | null;
  cashedOutAt!: string | null;

  public static fromDomain(bet: Bet): BetResponseDto {
    const dto = new BetResponseDto();

    dto.id = bet.id;
    dto.playerId = bet.playerId;
    dto.roundId = bet.roundId;
    dto.amount = formatAmount(bet.amount.value);
    dto.status = bet.status;
    dto.createdAt = bet.createdAt.toISOString();
    dto.cashoutMultiplier =
      bet.cashoutMultiplier !== null ? bet.cashoutMultiplier.value.toFixed(2) : null;
    dto.payoutAmount = bet.payoutAmount !== null ? formatAmount(bet.payoutAmount.value) : null;
    dto.cashedOutAt = bet.cashedOutAt !== null ? bet.cashedOutAt.toISOString() : null;

    return dto;
  }
}
