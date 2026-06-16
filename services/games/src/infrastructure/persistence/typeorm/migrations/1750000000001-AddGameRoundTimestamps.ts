import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddGameRoundTimestamps1750000000001 implements MigrationInterface {
  public name = "AddGameRoundTimestamps1750000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      ADD COLUMN "betting_ends_at" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      DROP COLUMN "updated_at",
      DROP COLUMN "betting_ends_at"
    `);
  }
}
