export interface ProvablyFairInput {
  readonly serverSeed: string;
  readonly clientSeed: string;
  readonly nonce: number;
  readonly maxCrashPoint?: number;
}

export interface CrashPointResult {
  readonly value: number;
  readonly basisPoints: number;
}

export interface VerifyRoundInput {
  readonly serverSeed: string | null;
  readonly serverSeedHash: string;
  readonly clientSeed: string;
  readonly nonce: number;
  readonly crashPointBasisPoints: number;
  readonly maxCrashPoint?: number;
}

export interface VerifyRoundResult {
  readonly hashValid: boolean;
  readonly crashPointValid: boolean;
  readonly isValid: boolean;
  readonly calculatedBasisPoints: number | null;
  readonly calculatedValue: number | null;
}
