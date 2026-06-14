import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "bets" })
export class BetOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  public id!: string;

  @Column({ name: "player_id", type: "uuid" })
  public playerId!: string;

  @Column({ name: "round_id", type: "uuid" })
  public roundId!: string;

  @Column({ type: "bigint" })
  public amount!: string;

  @Column({ type: "varchar", length: 20 })
  public status!: string;

  @Column({ name: "cashout_multiplier", type: "int", nullable: true })
  public cashoutMultiplier!: number | null;

  @Column({ name: "payout_amount", type: "bigint", nullable: true })
  public payoutAmount!: string | null;

  @Column({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @Column({ name: "cashed_out_at", type: "timestamptz", nullable: true })
  public cashedOutAt!: Date | null;
}
