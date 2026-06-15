import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";

export class DebitWalletDto {
  @IsUUID()
  walletId: string;

  @IsInt()
  @Min(1)
  amountCents: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  referenceId?: string;
}
