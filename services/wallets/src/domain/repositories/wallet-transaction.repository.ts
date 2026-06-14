import type { WalletTransaction } from "../entities/wallet-transaction.entity";

export interface WalletTransactionRepository {
  findById(id: string): Promise<WalletTransaction | null>;
  findByReferenceId(referenceId: string): Promise<WalletTransaction | null>;
  findByWalletId(walletId: string): Promise<WalletTransaction[]>;
  save(transaction: WalletTransaction): Promise<void>;
}
