import type { CryptoProvider } from "./types";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function digestSha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(digest);
}

async function digestHmacSha256(key: string, message: string): Promise<string> {
  const keyMaterial = new TextEncoder().encode(key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return toHex(signature);
}

export const webCryptoProvider: CryptoProvider = {
  sha256(value: string): Promise<string> {
    return digestSha256(value);
  },

  hmacSha256(key: string, message: string): Promise<string> {
    return digestHmacSha256(key, message);
  },
};
