import type { CrashPoint } from "../value-objects/crash-point.value-object";

export interface CrashPointGenerator {
  generate(): CrashPoint;
}
