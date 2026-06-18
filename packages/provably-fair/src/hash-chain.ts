import { randomBytes } from "node:crypto";
import type { CryptoProvider } from "./crypto/types";

export interface HashChain {
  readonly headHash: string;
  readonly length: number;
}

export function randomSeedHex(): string {
  return randomBytes(32).toString("hex");
}

export async function buildHashChainWithProvider(
  provider: CryptoProvider,
  length: number,
  terminalSeed: string = randomSeedHex(),
): Promise<{ chain: string[]; headHash: string }> {
  if (length < 1) {
    throw new Error("Hash chain length must be at least 1.");
  }

  const chain: string[] = new Array(length);
  chain[length - 1] = terminalSeed;

  for (let index = length - 2; index >= 0; index -= 1) {
    const nextSeed = chain[index + 1]!;
    chain[index] = await provider.sha256(nextSeed);
  }

  return {
    chain,
    headHash: chain[0]!,
  };
}

export async function verifyHashChainLinkWithProvider(
  provider: CryptoProvider,
  currentSeed: string,
  nextSeed: string,
): Promise<boolean> {
  const hashedCurrent = await provider.sha256(currentSeed);
  return hashedCurrent === nextSeed;
}

export function getSeedAtIndex(chain: readonly string[], index: number): string {
  if (index < 0 || index >= chain.length) {
    throw new Error("Hash chain index is out of bounds.");
  }

  return chain[index]!;
}
