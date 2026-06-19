import { describe, expect, test } from "bun:test";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from "../src/services/auth/pkce.util";

describe("pkce.util", () => {
  test("generates code verifier with valid length and charset", () => {
    const verifier = generateCodeVerifier();

    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  test("generates S256 code challenge from verifier", async () => {
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    const challenge = await generateCodeChallenge(verifier);

    expect(challenge).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  test("generates unique state values", () => {
    const first = generateState();
    const second = generateState();

    expect(first).not.toBe(second);
  });
});
