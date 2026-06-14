import { DomainError } from "../errors/domain-error";

export class Multiplier {
  public static readonly Scale = 100;
  private static readonly MinimumBasisPoints = 100;

  private readonly basisPoints: number;

  private constructor(basisPoints: number) {
    if (!Number.isInteger(basisPoints)) {
      throw new DomainError("Multiplier basis points must be an integer.");
    }

    if (basisPoints < Multiplier.MinimumBasisPoints) {
      throw new DomainError("Multiplier must be greater than or equal to 1.0.");
    }

    this.basisPoints = basisPoints;
  }

  public static fromValue(value: number): Multiplier {
    if (!Number.isFinite(value)) {
      throw new DomainError("Multiplier must be a finite number.");
    }

    return new Multiplier(Math.round(value * Multiplier.Scale));
  }

  public static fromBasisPoints(basisPoints: number): Multiplier {
    return new Multiplier(basisPoints);
  }

  public static minimum(): Multiplier {
    return new Multiplier(Multiplier.MinimumBasisPoints);
  }

  public get value(): number {
    return this.basisPoints / Multiplier.Scale;
  }

  public get valueInBasisPoints(): number {
    return this.basisPoints;
  }

  public isGreaterThan(multiplier: Multiplier): boolean {
    return this.basisPoints > multiplier.basisPoints;
  }

  public isGreaterThanOrEqual(multiplier: Multiplier): boolean {
    return this.basisPoints >= multiplier.basisPoints;
  }

  public equals(multiplier: Multiplier): boolean {
    return this.basisPoints === multiplier.basisPoints;
  }
}
