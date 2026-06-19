import { describe, expect, it } from "bun:test";
import { CrashCurve } from "../../src/domain/services/crash-curve";
import { CrashPoint } from "../../src/domain/value-objects/crash-point.value-object";

describe("CrashCurve", () => {
  const growthFactor = 0.23;
  const curve = new CrashCurve(growthFactor);

  it("calculateMultiplier returns 1.0 at elapsed zero", () => {
    expect(curve.calculateMultiplier(0)).toBeCloseTo(1, 5);
  });

  it("calculateMultiplier grows exponentially", () => {
    const atOneSecond = curve.calculateMultiplier(1);
    const atTwoSeconds = curve.calculateMultiplier(2);

    expect(atOneSecond).toBeGreaterThan(1);
    expect(atTwoSeconds).toBeGreaterThan(atOneSecond);
  });

  it("calculateCrashTime is inverse of multiplier growth", () => {
    const crashPoint = 1.19;
    const crashTime = curve.calculateCrashTime(crashPoint);
    const multiplierAtCrashTime = curve.calculateMultiplier(crashTime);

    expect(multiplierAtCrashTime).toBeCloseTo(crashPoint, 5);
  });

  it("calculateCrashAt is deterministic for fixed startedAt", () => {
    const startedAt = new Date("2024-01-01T00:00:00.000Z");
    const crashPoint = CrashPoint.fromBasisPoints(119);
    const expectedOffsetMs = Math.round((Math.log(1.19) / growthFactor) * 1000);

    const crashAt = curve.calculateCrashAt(startedAt, crashPoint);

    expect(crashAt.getTime()).toBe(startedAt.getTime() + expectedOffsetMs);
  });
});
