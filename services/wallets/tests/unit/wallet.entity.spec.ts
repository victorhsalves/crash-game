import { describe, expect, it } from "bun:test";
import { Money } from "@crash/money";
import { Wallet } from "../../src/domain/entities/wallet.entity";
import { WalletTransaction } from "../../src/domain/entities/wallet-transaction.entity";
import { TransactionType } from "../../src/domain/enums/transaction-type.enum";
import { DomainError } from "../../src/domain/errors/domain-error";
import { InsufficientBalanceError } from "../../src/domain/errors/insufficient-balance.error";
import { WalletCreditedEvent } from "../../src/domain/events/wallet-credited.event";
import { WalletDebitedEvent } from "../../src/domain/events/wallet-debited.event";

describe("Wallet", () => {
  const baseProps = {
    id: "wallet-1",
    playerId: "player-1",
  };

  it("starts with zero balance", () => {
    const wallet = new Wallet(baseProps);

    expect(wallet.balance.equals(Money.zero())).toBe(true);
  });

  it("rejects empty ids", () => {
    expect(() => new Wallet({ id: " ", playerId: "player-1" })).toThrow(DomainError);
    expect(() => new Wallet({ id: "wallet-1", playerId: " " })).toThrow(DomainError);
  });

  it("credit increases balance and emits WalletCreditedEvent", () => {
    const wallet = new Wallet(baseProps);
    const amount = Money.fromCents(5000n);

    wallet.credit(amount, "ref-credit");

    expect(wallet.balance.value).toBe(5000n);
    const events = wallet.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(WalletCreditedEvent);
    expect((events[0] as WalletCreditedEvent).payload.amountCents).toBe(5000n);
    expect((events[0] as WalletCreditedEvent).payload.balanceCents).toBe(5000n);
    expect((events[0] as WalletCreditedEvent).payload.referenceId).toBe("ref-credit");
  });

  it("debit decreases balance and emits WalletDebitedEvent", () => {
    const wallet = new Wallet(baseProps);
    wallet.credit(Money.fromCents(10_000n));

    wallet.debit(Money.fromCents(3000n), "ref-debit");

    expect(wallet.balance.value).toBe(7000n);
    const events = wallet.pullEvents();
    const debitEvent = events.find((event) => event instanceof WalletDebitedEvent);
    expect(debitEvent).toBeDefined();
    expect((debitEvent as WalletDebitedEvent).payload.amountCents).toBe(3000n);
  });

  it("debit exact balance leaves zero", () => {
    const wallet = new Wallet(baseProps);
    wallet.credit(Money.fromCents(1000n));

    wallet.debit(Money.fromCents(1000n));

    expect(wallet.balance.equals(Money.zero())).toBe(true);
  });

  it("debit throws InsufficientBalanceError when balance is insufficient", () => {
    const wallet = new Wallet(baseProps);
    wallet.credit(Money.fromCents(500n));

    expect(() => wallet.debit(Money.fromCents(1000n))).toThrow(InsufficientBalanceError);
    expect(wallet.balance.value).toBe(500n);
  });

  it("rejects zero credit and debit amounts", () => {
    const wallet = new Wallet(baseProps);

    expect(() => wallet.credit(Money.zero())).toThrow(DomainError);
    expect(() => wallet.debit(Money.zero())).toThrow(DomainError);
  });

  it("maintains monetary precision with large bigint values", () => {
    const wallet = new Wallet(baseProps);
    const large = Money.fromCents(100_000_000_000n);

    wallet.credit(large);
    wallet.debit(Money.fromCents(50_000_000_000n));
    wallet.credit(Money.fromCents(25_000_000_000n));

    expect(wallet.balance.value).toBe(75_000_000_000n);
  });

  it("updates updatedAt on credit and debit", () => {
    const wallet = new Wallet(baseProps);
    const initialUpdatedAt = wallet.updatedAt.getTime();

    wallet.credit(Money.fromCents(100n));

    expect(wallet.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt);
  });
});

describe("WalletTransaction", () => {
  const validProps = {
    id: "tx-1",
    walletId: "wallet-1",
    playerId: "player-1",
    amount: Money.fromCents(1000n),
    type: TransactionType.Credit,
  };

  it("creates valid transaction", () => {
    const transaction = new WalletTransaction(validProps);

    expect(transaction.id).toBe("tx-1");
    expect(transaction.amount.value).toBe(1000n);
    expect(transaction.referenceId).toBeNull();
  });

  it("accepts null referenceId", () => {
    const transaction = new WalletTransaction({ ...validProps, referenceId: null });

    expect(transaction.referenceId).toBeNull();
  });

  it("rejects zero amount", () => {
    expect(
      () =>
        new WalletTransaction({
          ...validProps,
          amount: Money.zero(),
        }),
    ).toThrow(DomainError);
  });

  it("rejects empty ids", () => {
    expect(() => new WalletTransaction({ ...validProps, id: " " })).toThrow(DomainError);
    expect(() => new WalletTransaction({ ...validProps, walletId: " " })).toThrow(DomainError);
    expect(() => new WalletTransaction({ ...validProps, playerId: " " })).toThrow(DomainError);
  });

  it("rejects empty referenceId string", () => {
    expect(
      () =>
        new WalletTransaction({
          ...validProps,
          referenceId: "  ",
        }),
    ).toThrow(DomainError);
  });
});
