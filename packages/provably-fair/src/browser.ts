import { calculateCrashPointWithProvider } from "./crash-point";
import { webCryptoProvider } from "./crypto/web-crypto";
import { verifyRoundWithProvider } from "./verify";
import type { ProvablyFairInput, VerifyRoundInput } from "./types";

export { PROVABLY_FAIR_TEST_VECTORS } from "./test-vectors";
export type {
  CrashPointResult,
  ProvablyFairInput,
  VerifyRoundInput,
  VerifyRoundResult,
} from "./types";

export function calculateCrashPointAsync(input: ProvablyFairInput) {
  return calculateCrashPointWithProvider(webCryptoProvider, input);
}

export function verifyRoundAsync(input: VerifyRoundInput) {
  return verifyRoundWithProvider(webCryptoProvider, input);
}
