import {
  DEFAULT_MAX_CRASH_POINT,
  EXPONENT_VALUE,
  HMAC_HEX_SLICE_LENGTH,
  MIN_CRASH_POINT,
} from "./constants";
import type { CryptoProvider } from "./crypto/types";
import type { CrashPointResult, ProvablyFairInput } from "./types";

function buildHmacMessage(clientSeed: string, nonce: number): string {
  return `${clientSeed}:${nonce}`;
}

function rawCrashPointFromHmacHex(hmacHex: string): number {
  const h = Number.parseInt(hmacHex.slice(0, HMAC_HEX_SLICE_LENGTH), 16);
  const raw = Math.floor((100 * EXPONENT_VALUE - h) / (EXPONENT_VALUE - h)) / 100;
  return raw;
}

export function clampCrashPoint(value: number, maxCrashPoint: number): number {
  if (value < MIN_CRASH_POINT) {
    return MIN_CRASH_POINT;
  }

  if (value > maxCrashPoint) {
    return maxCrashPoint;
  }

  return value;
}

export function toBasisPoints(value: number): number {
  return Math.round(value * 100);
}

export function crashPointResultFromRaw(
  raw: number,
  maxCrashPoint: number = DEFAULT_MAX_CRASH_POINT,
): CrashPointResult {
  const value = clampCrashPoint(raw, maxCrashPoint);
  return {
    value,
    basisPoints: toBasisPoints(value),
  };
}

export async function calculateCrashPointWithProvider(
  provider: CryptoProvider,
  input: ProvablyFairInput,
): Promise<CrashPointResult> {
  const maxCrashPoint = input.maxCrashPoint ?? DEFAULT_MAX_CRASH_POINT;
  const hmacHex = await provider.hmacSha256(input.serverSeed, buildHmacMessage(input.clientSeed, input.nonce));
  const raw = rawCrashPointFromHmacHex(hmacHex);
  return crashPointResultFromRaw(raw, maxCrashPoint);
}

export function calculateCrashPointFromProvider(
  provider: CryptoProvider,
  input: ProvablyFairInput,
): CrashPointResult {
  return calculateCrashPointFromProviderInternal(provider, input);
}

function calculateCrashPointFromProviderInternal(
  provider: CryptoProvider,
  input: ProvablyFairInput,
): CrashPointResult {
  const maxCrashPoint = input.maxCrashPoint ?? DEFAULT_MAX_CRASH_POINT;
  const hmacResult = provider.hmacSha256(input.serverSeed, buildHmacMessage(input.clientSeed, input.nonce));

  if (typeof hmacResult !== "string") {
    throw new Error("Expected synchronous HMAC result.");
  }

  const raw = rawCrashPointFromHmacHex(hmacResult);
  return crashPointResultFromRaw(raw, maxCrashPoint);
}

export function calculateCrashPointFromHmacHex(
  hmacHex: string,
  maxCrashPoint: number = DEFAULT_MAX_CRASH_POINT,
): CrashPointResult {
  const raw = rawCrashPointFromHmacHex(hmacHex);
  return crashPointResultFromRaw(raw, maxCrashPoint);
}
