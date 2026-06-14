import { DomainError } from "../errors/domain-error";
import { Multiplier } from "./multiplier.value-object";

export class CrashPoint {
  private static readonly MinimumBasisPoints = 100;

  private readonly basisPoints: number;

  private constructor(basisPoints: number) {
    if (!Number.isInteger(basisPoints)) {
      throw new DomainError("Crash point basis points must be an integer.");
    }

    if (basisPoints < CrashPoint.MinimumBasisPoints) {
      throw new DomainError("Crash point must be greater than or equal to 1.0.");
    }

    this.basisPoints = basisPoints;
  }

  public static fromValue(value: number): CrashPoint {
    if (!Number.isFinite(value)) {
      throw new DomainError("Crash point must be a finite number.");
    }

    return new CrashPoint(Math.round(value * Multiplier.Scale));
  }

  public static fromBasisPoints(basisPoints: number): CrashPoint {
    return new CrashPoint(basisPoints);
  }

  public get value(): number {
    return this.basisPoints / Multiplier.Scale;
  }

  public get valueInBasisPoints(): number {
    return this.basisPoints;
  }

  public toMultiplier(): Multiplier {
    return Multiplier.fromBasisPoints(this.basisPoints);
  }
}
