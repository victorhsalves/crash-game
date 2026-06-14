import { Money } from "@crash/money";
import { DomainError } from "../errors/domain-error";
import { WalletCreditedEvent } from "../events/wallet-credited.event";
import { WalletDebitedEvent } from "../events/wallet-debited.event";
import { AggregateRoot } from "../shared/aggregate-root";

export interface WalletProps {
  readonly id: string;
  readonly playerId: string;
  readonly balance?: Money;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class Wallet extends AggregateRoot {
  private readonly walletId: string;
  private readonly walletPlayerId: string;
  private walletBalance: Money;
  private readonly walletCreatedAt: Date;
  private walletUpdatedAt: Date;

  public constructor(props: WalletProps) {
    super();

    if (props.id.trim().length === 0) {
      throw new DomainError("Wallet id is required.");
    }

    if (props.playerId.trim().length === 0) {
      throw new DomainError("Wallet player id is required.");
    }

    const createdAt = props.createdAt ? new Date(props.createdAt.getTime()) : new Date();

    this.walletId = props.id;
    this.walletPlayerId = props.playerId;
    this.walletBalance = props.balance ?? Money.zero();
    this.walletCreatedAt = createdAt;
    this.walletUpdatedAt = props.updatedAt ? new Date(props.updatedAt.getTime()) : createdAt;
  }

  public get id(): string {
    return this.walletId;
  }

  public get playerId(): string {
    return this.walletPlayerId;
  }

  public get balance(): Money {
    return this.walletBalance;
  }

  public get createdAt(): Date {
    return new Date(this.walletCreatedAt.getTime());
  }

  public get updatedAt(): Date {
    return new Date(this.walletUpdatedAt.getTime());
  }

  public credit(amount: Money, referenceId: string | null = null): void {
    if (amount.isZero()) {
      throw new DomainError("Credit amount must be greater than zero.");
    }

    const creditedAt = new Date();

    this.walletBalance = this.walletBalance.add(amount);
    this.walletUpdatedAt = creditedAt;

    this.addEvent(
      new WalletCreditedEvent(
        {
          walletId: this.walletId,
          playerId: this.walletPlayerId,
          amountCents: amount.value,
          balanceCents: this.walletBalance.value,
          referenceId,
        },
        creditedAt,
      ),
    );
  }

  public debit(amount: Money, referenceId: string | null = null): void {
    if (amount.isZero()) {
      throw new DomainError("Debit amount must be greater than zero.");
    }

    const debitedAt = new Date();

    if (this.walletBalance.lessThan(amount)) {
      throw new DomainError("Insufficient balance.");
    }

    this.walletBalance = this.walletBalance.subtract(amount);
    this.walletUpdatedAt = debitedAt;

    this.addEvent(
      new WalletDebitedEvent(
        {
          walletId: this.walletId,
          playerId: this.walletPlayerId,
          amountCents: amount.value,
          balanceCents: this.walletBalance.value,
          referenceId,
        },
        debitedAt,
      ),
    );
  }

  public getBalance(): Money {
    return this.walletBalance;
  }
}
