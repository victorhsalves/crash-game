import { describe, expect, it } from "bun:test";
import {
  buildHashChainWithProvider,
  nodeCryptoProvider,
  verifyHashChainLinkWithProvider,
} from "../src/index";

describe("hash chain", () => {
  it("builds a chain where each seed hashes to the next", async () => {
    const terminalSeed = "terminal-seed-value";
    const built = await buildHashChainWithProvider(nodeCryptoProvider, 5, terminalSeed);

    expect(built.chain).toHaveLength(5);
    expect(built.chain[4]).toBe(terminalSeed);
    expect(built.headHash).toBe(built.chain[0]);

    for (let index = 0; index < built.chain.length - 1; index += 1) {
      const isValid = await verifyHashChainLinkWithProvider(
        nodeCryptoProvider,
        built.chain[index + 1]!,
        built.chain[index]!,
      );
      expect(isValid).toBe(true);
    }
  });
});
