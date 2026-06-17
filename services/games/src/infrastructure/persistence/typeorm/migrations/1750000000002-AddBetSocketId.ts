import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddBetSocketId1750000000002 implements MigrationInterface {
  public name = "AddBetSocketId1750000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bets"
      ADD COLUMN "socket_id" varchar(64) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bets"
      DROP COLUMN "socket_id"
    `);
  }
}
