import { Injectable } from "@nestjs/common";
import { MAX_CRASH_POINT } from "../../application/common/round-lifecycle.constants";
import type { CrashPointGenerator } from "../../domain/ports/crash-point-generator.port";
import { CrashPoint } from "../../domain/value-objects/crash-point.value-object";

interface Tier {
  readonly weight: number;
  readonly min: number;
  readonly max: number;
}

const TIERS: readonly Tier[] = [
  { weight: 0.7, min: 1.01, max: 3 },
  { weight: 0.2, min: 3, max: 10 },
  { weight: 0.09, min: 10, max: 100 },
  { weight: 0.01, min: 100, max: MAX_CRASH_POINT },
];

@Injectable()
export class TieredRandomCrashPointGenerator implements CrashPointGenerator {
  public generate(): CrashPoint {
    const tier = this.selectTier();
    const value = tier.min + Math.random() * (tier.max - tier.min);
    return CrashPoint.fromValue(value);
  }

  private selectTier(): Tier {
    const roll = Math.random();
    let cumulative = 0;

    for (const tier of TIERS) {
      cumulative += tier.weight;
      if (roll < cumulative) {
        return tier;
      }
    }

    return TIERS[TIERS.length - 1];
  }
}
