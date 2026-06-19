import { describe, expect, it } from "bun:test";
import { DomainError } from "../../src/domain/errors/domain-error";
import { Multiplier } from "../../src/domain/value-objects/multiplier.value-object";

describe("Multiplier", () => {
  it("minimum returns 1.00x (100 basis points)", () => {
    const multiplier = Multiplier.minimum();

    expect(multiplier.value).toBe(1);
    expect(multiplier.valueInBasisPoints).toBe(100);
  });

  it("fromValue rounds to basis points", () => {
    const multiplier = Multiplier.fromValue(2.505);

    expect(multiplier.valueInBasisPoints).toBe(251);
  });

  it("fromBasisPoints creates valid multiplier", () => {
    const multiplier = Multiplier.fromBasisPoints(250);

    expect(multiplier.value).toBe(2.5);
  });

  it("rejects non-finite values", () => {
    expect(() => Multiplier.fromValue(Number.NaN)).toThrow(DomainError);
    expect(() => Multiplier.fromValue(Number.POSITIVE_INFINITY)).toThrow(DomainError);
  });

  it("rejects basis points below minimum", () => {
    expect(() => Multiplier.fromBasisPoints(99)).toThrow(DomainError);
  });

  it("rejects non-integer basis points", () => {
    expect(() => Multiplier.fromBasisPoints(100.5)).toThrow(DomainError);
  });

  it("compares multipliers correctly", () => {
    const lower = Multiplier.fromBasisPoints(150);
    const higher = Multiplier.fromBasisPoints(200);

    expect(higher.isGreaterThan(lower)).toBe(true);
    expect(higher.isGreaterThanOrEqual(lower)).toBe(true);
    expect(lower.isGreaterThanOrEqual(higher)).toBe(false);
    expect(higher.equals(Multiplier.fromBasisPoints(200))).toBe(true);
  });
});
