import type { DataSourceOptions } from "typeorm";
import { WalletTransactionOrmEntity } from "./entities/wallet-transaction.orm-entity";
import { WalletOrmEntity } from "./entities/wallet.orm-entity";
import { InitialWalletsSchema1750000000000 } from "./migrations/1750000000000-InitialWalletsSchema";

export function buildDataSourceOptions(): DataSourceOptions {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is required to configure the wallets data source.");
  }

  return {
    type: "postgres",
    url,
    entities: [WalletOrmEntity, WalletTransactionOrmEntity],
    migrations: [InitialWalletsSchema1750000000000],
    synchronize: false,
    migrationsRun: false,
  };
}
