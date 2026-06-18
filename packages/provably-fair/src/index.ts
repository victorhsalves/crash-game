import { createHash } from "node:crypto";
import {
  calculateCrashPointFromProvider,
  calculateCrashPointWithProvider,
} from "./crash-point";
import { nodeCryptoProvider } from "./crypto/node-crypto";
import { webCryptoProvider } from "./crypto/web-crypto";
import { verifyRoundWithProvider } from "./verify";
import type { ProvablyFairInput, VerifyRoundInput, VerifyRoundResult } from "./types";

export {
  clampCrashPoint,
  calculateCrashPointFromHmacHex,
  calculateCrashPointFromProvider,
  calculateCrashPointWithProvider,
  crashPointResultFromRaw,
  toBasisPoints,
} from "./crash-point";
export { nodeCryptoProvider } from "./crypto/node-crypto";
export { webCryptoProvider } from "./crypto/web-crypto";
export type { CryptoProvider } from "./crypto/types";
export {
  buildHashChainWithProvider,
  getSeedAtIndex,
  randomSeedHex,
  verifyHashChainLinkWithProvider,
} from "./hash-chain";
export type { HashChain } from "./hash-chain";
export {
  DEFAULT_MAX_CRASH_POINT,
  EXPONENT_VALUE,
  HMAC_HEX_SLICE_LENGTH,
  MIN_CRASH_POINT,
} from "./constants";
export { PROVABLY_FAIR_TEST_VECTORS } from "./test-vectors";
export type {
  CrashPointResult,
  ProvablyFairInput,
  VerifyRoundInput,
  VerifyRoundResult,
} from "./types";
export { verifyRoundWithProvider } from "./verify";

export function verifyRoundSync(input: VerifyRoundInput): VerifyRoundResult {
  if (input.serverSeed === null) {
    return {
      hashValid: false,
      crashPointValid: false,
      isValid: false,
      calculatedBasisPoints: null,
      calculatedValue: null,
    };
  }

  const computedHash = createHash("sha256").update(input.serverSeed, "utf8").digest("hex");
  const calculated = calculateCrashPointFromProvider(nodeCryptoProvider, {
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

export function calculateCrashPoint(input: ProvablyFairInput) {
  return calculateCrashPointFromProvider(nodeCryptoProvider, input);
}

export function calculateCrashPointAsync(input: ProvablyFairInput) {
  return calculateCrashPointWithProvider(webCryptoProvider, input);
}

export function verifyRoundAsync(input: VerifyRoundInput) {
  return verifyRoundWithProvider(webCryptoProvider, input);
}

export function sha256Sync(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export async function sha256(value: string): Promise<string> {
  const result = await nodeCryptoProvider.sha256(value);
  return result;
}
