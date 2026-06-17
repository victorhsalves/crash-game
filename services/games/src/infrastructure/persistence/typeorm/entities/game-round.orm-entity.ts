import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "game_rounds" })
export class GameRoundOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  public id!: string;

  @Column({ type: "varchar", length: 20 })
  public status!: string;

  @Column({ name: "current_multiplier", type: "int" })
  public currentMultiplier!: number;

  @Column({ name: "crash_point", type: "int", nullable: true })
  public crashPoint!: number | null;

  @Column({ name: "crash_at", type: "timestamptz", nullable: true })
  public crashAt!: Date | null;

  @Column({ name: "betting_ends_at", type: "timestamptz", nullable: true })
  public bettingEndsAt!: Date | null;

  @Column({ name: "started_at", type: "timestamptz", nullable: true })
  public startedAt!: Date | null;

  @Column({ name: "crashed_at", type: "timestamptz", nullable: true })
  public crashedAt!: Date | null;

  @Column({ name: "finished_at", type: "timestamptz", nullable: true })
  public finishedAt!: Date | null;

  @Column({ name: "settled_at", type: "timestamptz", nullable: true })
  public settledAt!: Date | null;

  @Column({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @Column({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;
}
