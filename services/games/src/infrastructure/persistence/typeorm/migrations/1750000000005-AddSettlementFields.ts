import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSettlementFields1750000000005 implements MigrationInterface {
  public name = "AddSettlementFields1750000000005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      ADD COLUMN "settled_at" TIMESTAMP WITH TIME ZONE
    `);

    await queryRunner.query(`
      ALTER TABLE "bets"
      ADD COLUMN "payout_published_at" TIMESTAMP WITH TIME ZONE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bets"
      DROP COLUMN "payout_published_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      DROP COLUMN "settled_at"
    `);
  }
}
