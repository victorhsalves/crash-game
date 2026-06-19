import { describe, expect, it } from "bun:test";
import { DomainError } from "../../src/domain/errors/domain-error";
import { CrashPoint } from "../../src/domain/value-objects/crash-point.value-object";
import { Multiplier } from "../../src/domain/value-objects/multiplier.value-object";

describe("CrashPoint", () => {
  it("fromBasisPoints creates valid crash point", () => {
    const crashPoint = CrashPoint.fromBasisPoints(119);

    expect(crashPoint.value).toBe(1.19);
    expect(crashPoint.valueInBasisPoints).toBe(119);
  });

  it("minimum crash point is 1.01x (101 basis points)", () => {
    const crashPoint = CrashPoint.fromBasisPoints(101);

    expect(crashPoint.value).toBe(1.01);
  });

  it("rejects basis points below minimum", () => {
    expect(() => CrashPoint.fromBasisPoints(100)).toThrow(DomainError);
  });

  it("rejects non-finite values", () => {
    expect(() => CrashPoint.fromValue(Number.NaN)).toThrow(DomainError);
  });

  it("rejects non-integer basis points", () => {
    expect(() => CrashPoint.fromBasisPoints(119.5)).toThrow(DomainError);
  });

  it("toMultiplier converts to equivalent Multiplier", () => {
    const crashPoint = CrashPoint.fromBasisPoints(250);
    const multiplier = crashPoint.toMultiplier();

    expect(multiplier).toBeInstanceOf(Multiplier);
    expect(multiplier.valueInBasisPoints).toBe(250);
  });
});
