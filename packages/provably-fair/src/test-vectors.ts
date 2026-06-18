import type { ProvablyFairInput } from "./types";

export interface ProvablyFairTestVector {
  readonly input: ProvablyFairInput;
  readonly expectedBasisPoints: number;
  readonly expectedValue: number;
  readonly serverSeedHash?: string;
}

export const PROVABLY_FAIR_TEST_VECTORS: readonly ProvablyFairTestVector[] = [
  {
    input: {
      serverSeed: "abc123",
      clientSeed: "crash-challenge-v1",
      nonce: 1,
    },
    expectedBasisPoints: 119,
    expectedValue: 1.19,
    serverSeedHash: "6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090",
  },
  {
    input: {
      serverSeed: "def456",
      clientSeed: "crash-challenge-v1",
      nonce: 2,
    },
    expectedBasisPoints: 205,
    expectedValue: 2.05,
  },
  {
    input: {
      serverSeed: "0000000000000000000000000000000000000000000000000000000000000001",
      clientSeed: "crash-challenge-v1",
      nonce: 42,
    },
    expectedBasisPoints: 111,
    expectedValue: 1.11,
  },
];
