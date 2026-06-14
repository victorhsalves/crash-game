import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialWalletsSchema1750000000000 implements MigrationInterface {
  public name = "InitialWalletsSchema1750000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "wallets" (
        "id" uuid NOT NULL,
        "player_id" uuid NOT NULL,
        "balance" bigint NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wallets_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_wallets_player_id" UNIQUE ("player_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "wallet_transactions" (
        "id" uuid NOT NULL,
        "wallet_id" uuid NOT NULL,
        "player_id" uuid NOT NULL,
        "amount" bigint NOT NULL,
        "type" varchar(10) NOT NULL,
        "reference_id" varchar(255),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wallet_transactions_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_wallet_id" ON "wallet_transactions" ("wallet_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_player_id" ON "wallet_transactions" ("player_id")`);
    await queryRunner.query(`
      ALTER TABLE "wallet_transactions"
      ADD CONSTRAINT "FK_wallet_transactions_wallet_id"
      FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_wallet_transactions_wallet_id"`);
    await queryRunner.query(`DROP INDEX "IDX_wallet_transactions_player_id"`);
    await queryRunner.query(`DROP INDEX "IDX_wallet_transactions_wallet_id"`);
    await queryRunner.query(`DROP TABLE "wallet_transactions"`);
    await queryRunner.query(`DROP TABLE "wallets"`);
  }
}
