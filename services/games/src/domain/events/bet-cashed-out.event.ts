import type { DomainEvent } from "../shared/domain-event";

export interface BetCashedOutPayload {
  readonly betId: string;
  readonly roundId: string;
  readonly playerId: string;
  readonly amount: bigint;
  readonly cashoutMultiplier: number;
  readonly payoutAmount: bigint;
  readonly cashedOutAt: Date;
}

export class BetCashedOutEvent implements DomainEvent<BetCashedOutPayload> {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly payload: BetCashedOutPayload;

  public constructor(
    payload: BetCashedOutPayload,
    occurredAt: Date = payload.cashedOutAt,
    eventId: string = crypto.randomUUID(),
  ) {
    this.eventId = eventId;
    this.payload = payload;
    this.occurredAt = occurredAt;
  }
}
