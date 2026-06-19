import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Money } from "@crash/money";
import { Wallet } from "../../src/domain/entities/wallet.entity";
import type { WalletTransaction } from "../../src/domain/entities/wallet-transaction.entity";
import type { WalletTransactionRepository } from "../../src/domain/repositories/wallet-transaction.repository";
import type { WalletRepository } from "../../src/domain/repositories/wallet.repository";
import { CreateWalletUseCase } from "../../src/application/use-cases/create-wallet/create-wallet.use-case";
import { INITIAL_BALANCE_REFERENCE_ID } from "../../src/application/common/wallet.constants";
import { WalletAlreadyExistsError } from "../../src/application/errors/wallet-already-exists.error";
import type { UnitOfWork } from "../../src/application/ports/unit-of-work";
import { TransactionType } from "../../src/domain/enums/transaction-type.enum";

class InMemoryWalletRepository implements WalletRepository {
  private readonly wallets = new Map<string, Wallet>();

  public async findById(id: string): Promise<Wallet | null> {
    return [...this.wallets.values()].find((wallet) => wallet.id === id) ?? null;
  }

  public async findByPlayerId(playerId: string): Promise<Wallet | null> {
    return [...this.wallets.values()].find((wallet) => wallet.playerId === playerId) ?? null;
  }

  public async save(wallet: Wallet): Promise<void> {
    this.wallets.set(wallet.id, wallet);
  }
}

class InMemoryWalletTransactionRepository implements WalletTransactionRepository {
  public readonly saved: WalletTransaction[] = [];

  public async findById(id: string): Promise<WalletTransaction | null> {
    return this.saved.find((transaction) => transaction.id === id) ?? null;
  }

  public async findByReferenceId(referenceId: string): Promise<WalletTransaction | null> {
    return this.saved.find((transaction) => transaction.referenceId === referenceId) ?? null;
  }

  public async findByWalletId(walletId: string): Promise<WalletTransaction[]> {
    return this.saved.filter((transaction) => transaction.walletId === walletId);
  }

  public async save(transaction: WalletTransaction): Promise<void> {
    this.saved.push(transaction);
  }
}

function createUnitOfWork(
  wallets: InMemoryWalletRepository,
  walletTransactions: InMemoryWalletTransactionRepository,
): UnitOfWork {
  return {
    run: async (work) => work({ wallets, walletTransactions }),
  };
}

describe("CreateWalletUseCase", () => {
  const originalInitialBalance = process.env.INITIAL_WALLET_BALANCE_CENTS;

  beforeEach(() => {
    process.env.INITIAL_WALLET_BALANCE_CENTS = "2000";
  });

  afterEach(() => {
    if (originalInitialBalance === undefined) {
      delete process.env.INITIAL_WALLET_BALANCE_CENTS;
    } else {
      process.env.INITIAL_WALLET_BALANCE_CENTS = originalInitialBalance;
    }
  });

  it("creates wallet with initial balance when configured", async () => {
    const wallets = new InMemoryWalletRepository();
    const walletTransactions = new InMemoryWalletTransactionRepository();
    const useCase = new CreateWalletUseCase(createUnitOfWork(wallets, walletTransactions));

    const wallet = await useCase.execute({ playerId: "player-1" });

    expect(wallet.balance.value).toBe(2000n);
    expect(walletTransactions.saved).toHaveLength(1);
    expect(walletTransactions.saved[0]?.amount.value).toBe(2000n);
    expect(walletTransactions.saved[0]?.type).toBe(TransactionType.Credit);
    expect(walletTransactions.saved[0]?.referenceId).toBe(INITIAL_BALANCE_REFERENCE_ID);
  });

  it("creates wallet with zero balance when initial balance is disabled", async () => {
    process.env.INITIAL_WALLET_BALANCE_CENTS = "0";

    const wallets = new InMemoryWalletRepository();
    const walletTransactions = new InMemoryWalletTransactionRepository();
    const useCase = new CreateWalletUseCase(createUnitOfWork(wallets, walletTransactions));

    const wallet = await useCase.execute({ playerId: "player-1" });

    expect(wallet.balance.equals(Money.zero())).toBe(true);
    expect(walletTransactions.saved).toHaveLength(0);
  });

  it("throws WalletAlreadyExistsError when wallet already exists for player", async () => {
    const wallets = new InMemoryWalletRepository();
    const walletTransactions = new InMemoryWalletTransactionRepository();
    const useCase = new CreateWalletUseCase(createUnitOfWork(wallets, walletTransactions));

    await useCase.execute({ playerId: "player-1" });

    await expect(useCase.execute({ playerId: "player-1" })).rejects.toThrow(WalletAlreadyExistsError);
    expect(walletTransactions.saved).toHaveLength(1);
  });
});
