import type { MigrationInterface, QueryRunner } from "typeorm";

export class RoundLifecycleFields1750000000003 implements MigrationInterface {
  public name = "RoundLifecycleFields1750000000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      ADD COLUMN "finished_at" TIMESTAMP WITH TIME ZONE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      DROP COLUMN "finished_at"
    `);
  }
}
