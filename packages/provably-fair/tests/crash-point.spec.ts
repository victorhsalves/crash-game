import { describe, expect, it } from "bun:test";
import { calculateCrashPoint, verifyRoundSync } from "../src/index";
import { PROVABLY_FAIR_TEST_VECTORS } from "../src/test-vectors";
import { clampCrashPoint, toBasisPoints } from "../src/crash-point";

describe("calculateCrashPoint", () => {
  it("returns deterministic bustabit results for known vectors", async () => {
    for (const vector of PROVABLY_FAIR_TEST_VECTORS) {
      const result = await calculateCrashPoint(vector.input);
      expect(result.basisPoints).toBe(vector.expectedBasisPoints);
      expect(result.value).toBe(vector.expectedValue);
    }
  });

  it("clamps values below minimum crash point", () => {
    expect(clampCrashPoint(0.5, 1000)).toBe(1.01);
    expect(toBasisPoints(1.01)).toBe(101);
  });

  it("clamps values above maximum crash point", () => {
    expect(clampCrashPoint(1500, 1000)).toBe(1000);
  });
});

describe("verifyRoundSync", () => {
  it("validates hash and crash point for known vector", async () => {
    const vector = PROVABLY_FAIR_TEST_VECTORS[0]!;

    const result = await verifyRoundSync({
      serverSeed: vector.input.serverSeed,
      serverSeedHash: vector.serverSeedHash!,
      clientSeed: vector.input.clientSeed,
      nonce: vector.input.nonce,
      crashPointBasisPoints: vector.expectedBasisPoints,
    });

    expect(result.isValid).toBe(true);
    expect(result.hashValid).toBe(true);
    expect(result.crashPointValid).toBe(true);
    expect(result.calculatedBasisPoints).toBe(vector.expectedBasisPoints);
  });
});
