import { IsInt, IsUUID, Min } from "class-validator";

export class SetWalletBalanceDto {
  @IsUUID()
  walletId: string;

  @IsInt()
  @Min(0)
  targetBalanceCents: number;
}
