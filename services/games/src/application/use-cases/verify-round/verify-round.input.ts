export interface VerifyRoundInput {
  roundId: string;
}

export interface VerifyRoundResult {
  roundId: string;
  status: string;
  serverSeed: string | null;
  serverSeedHash: string | null;
  clientSeed: string | null;
  nonce: number | null;
  crashPoint: string | null;
  calculatedCrashPoint: string | null;
  isValid: boolean;
  hashValid: boolean;
  crashPointValid: boolean;
}
