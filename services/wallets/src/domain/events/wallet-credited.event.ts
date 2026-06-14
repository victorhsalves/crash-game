import type { DomainEvent } from "../shared/domain-event";

export interface WalletCreditedPayload {
  readonly walletId: string;
  readonly playerId: string;
  readonly amountCents: bigint;
  readonly balanceCents: bigint;
  readonly referenceId: string | null;
}

export class WalletCreditedEvent implements DomainEvent<WalletCreditedPayload> {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly payload: WalletCreditedPayload;

  public constructor(payload: WalletCreditedPayload, occurredAt: Date = new Date(), eventId: string = crypto.randomUUID()) {
    this.eventId = eventId;
    this.payload = payload;
    this.occurredAt = occurredAt;
  }
}
