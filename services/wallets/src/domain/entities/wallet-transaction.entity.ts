import { Money } from "@crash/money";
import { TransactionType } from "../enums/transaction-type.enum";
import { DomainError } from "../errors/domain-error";

export interface WalletTransactionProps {
  readonly id: string;
  readonly walletId: string;
  readonly playerId: string;
  readonly amount: Money;
  readonly type: TransactionType;
  readonly referenceId?: string | null;
  readonly createdAt?: Date;
}

export class WalletTransaction {
  private readonly transactionId: string;
  private readonly transactionWalletId: string;
  private readonly transactionPlayerId: string;
  private readonly transactionAmount: Money;
  private readonly transactionType: TransactionType;
  private readonly transactionReferenceId: string | null;
  private readonly transactionCreatedAt: Date;

  public constructor(props: WalletTransactionProps) {
    if (props.id.trim().length === 0) {
      throw new DomainError("Wallet transaction id is required.");
    }

    if (props.walletId.trim().length === 0) {
      throw new DomainError("Wallet transaction wallet id is required.");
    }

    if (props.playerId.trim().length === 0) {
      throw new DomainError("Wallet transaction player id is required.");
    }

    if (props.amount.isZero()) {
      throw new DomainError("Wallet transaction amount must be greater than zero.");
    }

    if (props.referenceId !== undefined && props.referenceId !== null && props.referenceId.trim().length === 0) {
      throw new DomainError("Wallet transaction reference id cannot be empty.");
    }

    this.transactionId = props.id;
    this.transactionWalletId = props.walletId;
    this.transactionPlayerId = props.playerId;
    this.transactionAmount = props.amount;
    this.transactionType = props.type;
    this.transactionReferenceId = props.referenceId ?? null;
    this.transactionCreatedAt = props.createdAt ? new Date(props.createdAt.getTime()) : new Date();
  }

  public get id(): string {
    return this.transactionId;
  }

  public get walletId(): string {
    return this.transactionWalletId;
  }

  public get playerId(): string {
    return this.transactionPlayerId;
  }

  public get amount(): Money {
    return this.transactionAmount;
  }

  public get type(): TransactionType {
    return this.transactionType;
  }

  public get referenceId(): string | null {
    return this.transactionReferenceId;
  }

  public get createdAt(): Date {
    return new Date(this.transactionCreatedAt.getTime());
  }
}
