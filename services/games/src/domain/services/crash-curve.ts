import type { CrashPoint } from "../value-objects/crash-point.value-object";

export class CrashCurve {
  public constructor(private readonly growthFactor: number) {}

  public calculateMultiplier(elapsedSeconds: number): number {
    return Math.exp(this.growthFactor * elapsedSeconds);
  }

  public calculateCrashTime(crashPoint: number): number {
    return Math.log(crashPoint) / this.growthFactor;
  }

  public calculateCrashAt(startedAt: Date, crashPoint: CrashPoint): Date {
    const seconds = this.calculateCrashTime(crashPoint.value);
    return new Date(startedAt.getTime() + Math.round(seconds * 1000));
  }
}
