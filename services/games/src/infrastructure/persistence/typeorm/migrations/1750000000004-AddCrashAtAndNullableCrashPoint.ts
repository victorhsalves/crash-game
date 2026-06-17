import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddCrashAtAndNullableCrashPoint1750000000004 implements MigrationInterface {
  public name = "AddCrashAtAndNullableCrashPoint1750000000004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      ADD COLUMN "crash_at" TIMESTAMP WITH TIME ZONE
    `);

    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      ALTER COLUMN "crash_point" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      ALTER COLUMN "crash_point" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "game_rounds"
      DROP COLUMN "crash_at"
    `);
  }
}
