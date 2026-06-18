import { describe, expect, it } from "bun:test";
import {
  calculateCrashPointAsync,
  PROVABLY_FAIR_TEST_VECTORS,
  verifyRoundAsync,
} from "@crash/provably-fair/browser";

describe("frontend provably fair integration", () => {
  it("matches shared test vectors with async web crypto", async () => {
    for (const vector of PROVABLY_FAIR_TEST_VECTORS) {
      const result = await calculateCrashPointAsync(vector.input);
      expect(result.basisPoints).toBe(vector.expectedBasisPoints);
      expect(result.value).toBe(vector.expectedValue);
    }
  });

  it("verifies known round data asynchronously", async () => {
    const vector = PROVABLY_FAIR_TEST_VECTORS[0]!;

    const result = await verifyRoundAsync({
      serverSeed: vector.input.serverSeed,
      serverSeedHash: vector.serverSeedHash!,
      clientSeed: vector.input.clientSeed,
      nonce: vector.input.nonce,
      crashPointBasisPoints: vector.expectedBasisPoints,
    });

    expect(result.isValid).toBe(true);
  });
});
