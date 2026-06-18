import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddProvablyFairFields1750000000006 implements MigrationInterface {
  public name = "AddProvablyFairFields1750000000006";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      ADD COLUMN "server_seed" VARCHAR(64),
      ADD COLUMN "server_seed_hash" VARCHAR(64),
      ADD COLUMN "client_seed" VARCHAR(64),
      ADD COLUMN "nonce" INTEGER,
      ADD COLUMN "chain_index" INTEGER
    `);

    await queryRunner.query(`
      CREATE TABLE "fairness_state" (
        "id" INTEGER NOT NULL,
        "terminal_seed" VARCHAR(64) NOT NULL,
        "chain_head_hash" VARCHAR(64) NOT NULL,
        "chain_length" INTEGER NOT NULL,
        "current_chain_index" INTEGER NOT NULL,
        "next_round_nonce" INTEGER NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_fairness_state" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "fairness_state"`);

    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      DROP COLUMN "chain_index",
      DROP COLUMN "nonce",
      DROP COLUMN "client_seed",
      DROP COLUMN "server_seed_hash",
      DROP COLUMN "server_seed"
    `);
  }
}
