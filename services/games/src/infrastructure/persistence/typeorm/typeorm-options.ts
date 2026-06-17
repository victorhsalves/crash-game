import type { DataSourceOptions } from "typeorm";
import { BetOrmEntity } from "./entities/bet.orm-entity";
import { GameRoundOrmEntity } from "./entities/game-round.orm-entity";
import { InitialGamesSchema1750000000000 } from "./migrations/1750000000000-InitialGamesSchema";
import { AddGameRoundTimestamps1750000000001 } from "./migrations/1750000000001-AddGameRoundTimestamps";
import { AddBetSocketId1750000000002 } from "./migrations/1750000000002-AddBetSocketId";

export function buildDataSourceOptions(): DataSourceOptions {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is required to configure the games data source.");
  }

  return {
    type: "postgres",
    url,
    entities: [GameRoundOrmEntity, BetOrmEntity],
    migrations: [
      InitialGamesSchema1750000000000,
      AddGameRoundTimestamps1750000000001,
      AddBetSocketId1750000000002,
    ],
    synchronize: false,
    migrationsRun: false,
  };
}
