import { createHash, createHmac } from "node:crypto";
import type { CryptoProvider } from "./types";

function toHexDigest(buffer: Buffer): string {
  return buffer.toString("hex");
}

export const nodeCryptoProvider: CryptoProvider = {
  sha256(value: string): string {
    return toHexDigest(createHash("sha256").update(value, "utf8").digest());
  },

  hmacSha256(key: string, message: string): string {
    return toHexDigest(createHmac("sha256", key).update(message, "utf8").digest());
  },
};
