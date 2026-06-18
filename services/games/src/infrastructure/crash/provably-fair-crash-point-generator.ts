import { Injectable } from "@nestjs/common";
import { calculateCrashPoint } from "@crash/provably-fair";
import { MAX_CRASH_POINT } from "../../application/common/round-lifecycle.constants";
import type {
  CrashPointGenerator,
  CrashPointGeneratorInput,
} from "../../domain/ports/crash-point-generator.port";
import { CrashPoint } from "../../domain/value-objects/crash-point.value-object";

@Injectable()
export class ProvablyFairCrashPointGenerator implements CrashPointGenerator {
  public generate(input: CrashPointGeneratorInput): CrashPoint {
    const result = calculateCrashPoint({
      serverSeed: input.serverSeed,
      clientSeed: input.clientSeed,
      nonce: input.nonce,
      maxCrashPoint: MAX_CRASH_POINT,
    });

    return CrashPoint.fromBasisPoints(result.basisPoints);
  }
}
