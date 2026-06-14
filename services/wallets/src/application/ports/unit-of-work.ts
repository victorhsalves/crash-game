import type { WalletTransactionRepository } from "../../domain/repositories/wallet-transaction.repository";
import type { WalletRepository } from "../../domain/repositories/wallet.repository";

export interface RepositoryContext {
  readonly wallets: WalletRepository;
  readonly walletTransactions: WalletTransactionRepository;
}

export interface UnitOfWork {
  run<T>(work: (ctx: RepositoryContext) => Promise<T>): Promise<T>;
}
