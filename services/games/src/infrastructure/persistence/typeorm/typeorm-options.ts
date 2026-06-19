import type { DataSourceOptions } from "typeorm";
import { BetOrmEntity } from "./entities/bet.orm-entity";
import { FairnessStateOrmEntity } from "./entities/fairness-state.orm-entity";
import { GameRoundOrmEntity } from "./entities/game-round.orm-entity";
import { InitialGamesSchema1750000000000 } from "./migrations/1750000000000-InitialGamesSchema";
import { AddGameRoundTimestamps1750000000001 } from "./migrations/1750000000001-AddGameRoundTimestamps";
import { AddBetSocketId1750000000002 } from "./migrations/1750000000002-AddBetSocketId";
import { RoundLifecycleFields1750000000003 } from "./migrations/1750000000003-RoundLifecycleFields";
import { AddCrashAtAndNullableCrashPoint1750000000004 } from "./migrations/1750000000004-AddCrashAtAndNullableCrashPoint";
import { AddSettlementFields1750000000005 } from "./migrations/1750000000005-AddSettlementFields";
import { AddProvablyFairFields1750000000006 } from "./migrations/1750000000006-AddProvablyFairFields";
import { AddBetPlayerUsername1750000000007 } from "./migrations/1750000000007-AddBetPlayerUsername";

export function buildDataSourceOptions(): DataSourceOptions {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is required to configure the games data source.");
  }

  return {
    type: "postgres",
    url,
    entities: [GameRoundOrmEntity, BetOrmEntity, FairnessStateOrmEntity],
    migrations: [
      InitialGamesSchema1750000000000,
      AddGameRoundTimestamps1750000000001,
      AddBetSocketId1750000000002,
      RoundLifecycleFields1750000000003,
      AddCrashAtAndNullableCrashPoint1750000000004,
      AddSettlementFields1750000000005,
      AddProvablyFairFields1750000000006,
      AddBetPlayerUsername1750000000007,
    ],
    synchronize: false,
    migrationsRun: false,
  };
}
