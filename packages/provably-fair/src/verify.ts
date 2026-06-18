import type { CryptoProvider } from "./crypto/types";
import type { VerifyRoundInput, VerifyRoundResult } from "./types";
import { calculateCrashPointWithProvider } from "./crash-point";

export async function verifyRoundWithProvider(
  provider: CryptoProvider,
  input: VerifyRoundInput,
): Promise<VerifyRoundResult> {
  if (input.serverSeed === null) {
    return emptyVerifyResult();
  }

  const computedHash = await provider.sha256(input.serverSeed);
  const calculated = await calculateCrashPointWithProvider(provider, {
    serverSeed: input.serverSeed,
    clientSeed: input.clientSeed,
    nonce: input.nonce,
    maxCrashPoint: input.maxCrashPoint,
  });

  const hashValid = computedHash === input.serverSeedHash;
  const crashPointValid = calculated.basisPoints === input.crashPointBasisPoints;

  return {
    hashValid,
    crashPointValid,
    isValid: hashValid && crashPointValid,
    calculatedBasisPoints: calculated.basisPoints,
    calculatedValue: calculated.value,
  };
}

function emptyVerifyResult(): VerifyRoundResult {
  return {
    hashValid: false,
    crashPointValid: false,
    isValid: false,
    calculatedBasisPoints: null,
    calculatedValue: null,
  };
}
