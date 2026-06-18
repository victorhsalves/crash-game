import type { VerifyRoundResult } from "../../application/use-cases/verify-round/verify-round.input";

export class VerifyRoundResponseDto {
  roundId!: string;
  status!: string;
  serverSeed!: string | null;
  serverSeedHash!: string | null;
  clientSeed!: string | null;
  nonce!: number | null;
  crashPoint!: string | null;
  calculatedCrashPoint!: string | null;
  isValid!: boolean;
  hashValid!: boolean;
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
