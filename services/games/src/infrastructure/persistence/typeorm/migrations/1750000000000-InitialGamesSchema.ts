import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialGamesSchema1750000000000 implements MigrationInterface {
  public name = "InitialGamesSchema1750000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "game_rounds" (
        "id" uuid NOT NULL,
        "status" varchar(20) NOT NULL,
        "current_multiplier" integer NOT NULL,
        "crash_point" integer NOT NULL,
        "started_at" TIMESTAMP WITH TIME ZONE,
        "crashed_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_game_rounds_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_game_rounds_status" ON "game_rounds" ("status")`);

    await queryRunner.query(`
      CREATE TABLE "bets" (
        "id" uuid NOT NULL,
        "player_id" uuid NOT NULL,
        "round_id" uuid NOT NULL,
        "amount" bigint NOT NULL,
        "status" varchar(20) NOT NULL,
        "cashout_multiplier" integer,
        "payout_amount" bigint,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "cashed_out_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_bets_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_bets_round_id" ON "bets" ("round_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_bets_player_id" ON "bets" ("player_id")`);
    await queryRunner.query(
      `ALTER TABLE "bets" ADD CONSTRAINT "UQ_bets_player_id_round_id" UNIQUE ("player_id", "round_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "bets"
      ADD CONSTRAINT "FK_bets_round_id"
      FOREIGN KEY ("round_id") REFERENCES "game_rounds"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bets" DROP CONSTRAINT "FK_bets_round_id"`);
    await queryRunner.query(`ALTER TABLE "bets" DROP CONSTRAINT "UQ_bets_player_id_round_id"`);
    await queryRunner.query(`DROP INDEX "IDX_bets_player_id"`);
    await queryRunner.query(`DROP INDEX "IDX_bets_round_id"`);
    await queryRunner.query(`DROP TABLE "bets"`);
    await queryRunner.query(`DROP INDEX "IDX_game_rounds_status"`);
    await queryRunner.query(`DROP TABLE "game_rounds"`);
  }
}
