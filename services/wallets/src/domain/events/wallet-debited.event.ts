import type { DomainEvent } from "../shared/domain-event";

export interface WalletDebitedPayload {
  readonly walletId: string;
  readonly playerId: string;
  readonly amountCents: bigint;
  readonly balanceCents: bigint;
  readonly referenceId: string | null;
}

export class WalletDebitedEvent implements DomainEvent<WalletDebitedPayload> {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly payload: WalletDebitedPayload;

  public constructor(payload: WalletDebitedPayload, occurredAt: Date = new Date(), eventId: string = crypto.randomUUID()) {
    this.eventId = eventId;
    this.payload = payload;
    this.occurredAt = occurredAt;
  }
}
