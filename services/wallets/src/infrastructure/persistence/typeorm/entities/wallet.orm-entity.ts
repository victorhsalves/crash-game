import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "wallets" })
export class WalletOrmEntity {
  @PrimaryColumn({ type: "uuid" })
  public id!: string;

  @Column({ name: "player_id", type: "uuid" })
  public playerId!: string;

  @Column({ type: "bigint" })
  public balance!: string;

  @Column({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @Column({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;
}
