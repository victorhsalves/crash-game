import { ApiProperty } from "@nestjs/swagger";
import { Bet } from "../../domain/entities/bet.entity";
import { BetStatus } from "../../domain/enums/bet-status.enum";

function formatAmount(cents: bigint): string {
  return (Number(cents) / 100).toFixed(2);
}

export class BetResponseDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  playerId!: string;

  @ApiProperty({ format: "uuid" })
  roundId!: string;

  @ApiProperty({ example: "10.00", description: "Valor da aposta formatado" })
  amount!: string;

  @ApiProperty({ enum: BetStatus, enumName: "BetStatus" })
  status!: BetStatus;

  @ApiProperty({ format: "date-time" })
  createdAt!: string;

  @ApiProperty({ example: "2.50", nullable: true })
  cashoutMultiplier!: string | null;

  @ApiProperty({ example: "25.00", nullable: true })
  payoutAmount!: string | null;

  @ApiProperty({ format: "date-time", nullable: true })
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
