import type { DataSourceOptions } from "typeorm";
import { BetOrmEntity } from "./entities/bet.orm-entity";
import { GameRoundOrmEntity } from "./entities/game-round.orm-entity";
import { InitialGamesSchema1750000000000 } from "./migrations/1750000000000-InitialGamesSchema";

export function buildDataSourceOptions(): DataSourceOptions {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is required to configure the games data source.");
  }

  return {
    type: "postgres",
    url,
    entities: [GameRoundOrmEntity, BetOrmEntity],
    migrations: [InitialGamesSchema1750000000000],
    synchronize: false,
    migrationsRun: false,
  };
}
