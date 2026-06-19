import { describe, expect, it } from "bun:test";
import { PROVABLY_FAIR_TEST_VECTORS } from "@crash/provably-fair";
import { ProvablyFairCrashPointGenerator } from "../../src/infrastructure/crash/provably-fair-crash-point-generator";

describe("ProvablyFairCrashPointGenerator", () => {
  const generator = new ProvablyFairCrashPointGenerator();

  it("maps known test vectors to CrashPoint basis points", () => {
    for (const vector of PROVABLY_FAIR_TEST_VECTORS) {
      const crashPoint = generator.generate({
        serverSeed: vector.input.serverSeed,
        clientSeed: vector.input.clientSeed,
        nonce: vector.input.nonce,
      });

      expect(crashPoint.valueInBasisPoints).toBe(vector.expectedBasisPoints);
      expect(crashPoint.value).toBe(vector.expectedValue);
    }
  });
});
