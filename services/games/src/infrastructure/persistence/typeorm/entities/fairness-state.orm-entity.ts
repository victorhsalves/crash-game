import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "fairness_state" })
export class FairnessStateOrmEntity {
  @PrimaryColumn({ type: "int" })
  public id!: number;

  @Column({ name: "terminal_seed", type: "varchar", length: 64 })
  public terminalSeed!: string;

  @Column({ name: "chain_head_hash", type: "varchar", length: 64 })
  public chainHeadHash!: string;

  @Column({ name: "chain_length", type: "int" })
  public chainLength!: number;

  @Column({ name: "current_chain_index", type: "int" })
  public currentChainIndex!: number;

  @Column({ name: "next_round_nonce", type: "int" })
  public nextRoundNonce!: number;

  @Column({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;
}
