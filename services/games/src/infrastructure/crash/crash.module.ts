import { Module } from "@nestjs/common";
import { CURVE_GROWTH_FACTOR } from "../../application/common/round-lifecycle.constants";
import { CRASH_CURVE, CRASH_POINT_GENERATOR } from "../../application/common/tokens";
import { CrashCurve } from "../../domain/services/crash-curve";
import { PersistenceModule } from "../persistence/persistence.module";
import { HashChainSeedProvider } from "./hash-chain-seed-provider";
import { ProvablyFairCrashPointGenerator } from "./provably-fair-crash-point-generator";

@Module({
  imports: [PersistenceModule],
  providers: [
    HashChainSeedProvider,
    {
      provide: CRASH_POINT_GENERATOR,
      useClass: ProvablyFairCrashPointGenerator,
    },
    {
      provide: CRASH_CURVE,
      useFactory: () => new CrashCurve(CURVE_GROWTH_FACTOR),
    },
  ],
  exports: [CRASH_POINT_GENERATOR, CRASH_CURVE, HashChainSeedProvider],
})
export class CrashModule {}
