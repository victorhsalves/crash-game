import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "wallet_transactions" })
export class WalletTransactionOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  public id!: string;

  @Column({ name: "wallet_id", type: "uuid" })
  public walletId!: string;

  @Column({ name: "player_id", type: "uuid" })
  public playerId!: string;

  @Column({ type: "bigint" })
  public amount!: string;

  @Column({ type: "varchar", length: 10 })
  public type!: string;

  @Column({ name: "reference_id", type: "varchar", length: 255, nullable: true })
  public referenceId!: string | null;

  @Column({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;
}
