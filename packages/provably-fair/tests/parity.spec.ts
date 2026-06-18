import { describe, expect, it } from "bun:test";
import {
  calculateCrashPoint,
  calculateCrashPointAsync,
  nodeCryptoProvider,
  verifyRoundAsync,
  verifyRoundSync,
  webCryptoProvider,
} from "../src/index";
import { PROVABLY_FAIR_TEST_VECTORS } from "../src/test-vectors";

describe("node vs web crypto parity", () => {
  it("produces identical crash points", async () => {
    for (const vector of PROVABLY_FAIR_TEST_VECTORS) {
      const syncResult = await calculateCrashPoint(vector.input);
      const asyncResult = await calculateCrashPointAsync(vector.input);

      expect(asyncResult.basisPoints).toBe(syncResult.basisPoints);
      expect(asyncResult.value).toBe(syncResult.value);
    }
  });

  it("produces identical sha256 hashes", async () => {
    const nodeHash = await nodeCryptoProvider.sha256("abc123");
    const webHash = await webCryptoProvider.sha256("abc123");
    expect(webHash).toBe(nodeHash);
  });

  it("produces identical verification results", async () => {
    const vector = PROVABLY_FAIR_TEST_VECTORS[0]!;
    const input = {
      serverSeed: vector.input.serverSeed,
      serverSeedHash: vector.serverSeedHash!,
      clientSeed: vector.input.clientSeed,
      nonce: vector.input.nonce,
      crashPointBasisPoints: vector.expectedBasisPoints,
    };

    const syncResult = await verifyRoundSync(input);
    const asyncResult = await verifyRoundAsync(input);

    expect(asyncResult).toEqual(syncResult);
  });
});
