import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddBetPlayerUsername1750000000007 implements MigrationInterface {
  public name = "AddBetPlayerUsername1750000000007";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bets"
      ADD COLUMN "player_username" varchar(255) NOT NULL DEFAULT ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bets"
      DROP COLUMN "player_username"
    `);
  }
}
