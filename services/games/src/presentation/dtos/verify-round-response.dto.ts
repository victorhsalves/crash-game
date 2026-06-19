import { ApiProperty } from "@nestjs/swagger";
import type { VerifyRoundResult } from "../../application/use-cases/verify-round/verify-round.input";

export class VerifyRoundResponseDto {
  @ApiProperty({ format: "uuid" })
  roundId!: string;

  @ApiProperty({ example: "CRASHED" })
  status!: string;

  @ApiProperty({ nullable: true })
  serverSeed!: string | null;

  @ApiProperty({ nullable: true })
  serverSeedHash!: string | null;

  @ApiProperty({ nullable: true })
  clientSeed!: string | null;

  @ApiProperty({ nullable: true })
  nonce!: number | null;

  @ApiProperty({ example: "2.34", nullable: true })
  crashPoint!: string | null;

  @ApiProperty({ example: "2.34", nullable: true })
  calculatedCrashPoint!: string | null;

  @ApiProperty({ example: true })
  isValid!: boolean;

  @ApiProperty({ example: true })
  hashValid!: boolean;

  @ApiProperty({ example: true })
  crashPointValid!: boolean;

  public static fromResult(result: VerifyRoundResult): VerifyRoundResponseDto {
    const dto = new VerifyRoundResponseDto();
    dto.roundId = result.roundId;
    dto.status = result.status;
    dto.serverSeed = result.serverSeed;
    dto.serverSeedHash = result.serverSeedHash;
    dto.clientSeed = result.clientSeed;
    dto.nonce = result.nonce;
    dto.crashPoint = result.crashPoint;
    dto.calculatedCrashPoint = result.calculatedCrashPoint;
    dto.isValid = result.isValid;
    dto.hashValid = result.hashValid;
    dto.crashPointValid = result.crashPointValid;
    return dto;
  }
}
