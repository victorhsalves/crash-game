import type { CrashPoint } from "../../domain/value-objects/crash-point.value-object";

export interface CrashPointGeneratorInput {
  readonly serverSeed: string;
  readonly clientSeed: string;
  readonly nonce: number;
}

export interface CrashPointGenerator {
  generate(input: CrashPointGeneratorInput): CrashPoint;
}
