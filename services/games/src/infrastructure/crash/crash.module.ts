import { Module } from "@nestjs/common";
import { CURVE_GROWTH_FACTOR } from "../../application/common/round-lifecycle.constants";
import { CRASH_CURVE, CRASH_POINT_GENERATOR } from "../../application/common/tokens";
import { CrashCurve } from "../../domain/services/crash-curve";
import { TieredRandomCrashPointGenerator } from "./tiered-random-crash-point-generator";

@Module({
  providers: [
    {
      provide: CRASH_POINT_GENERATOR,
      useClass: TieredRandomCrashPointGenerator,
    },
    {
      provide: CRASH_CURVE,
      useFactory: () => new CrashCurve(CURVE_GROWTH_FACTOR),
    },
  ],
  exports: [CRASH_POINT_GENERATOR, CRASH_CURVE],
})
export class CrashModule {}
