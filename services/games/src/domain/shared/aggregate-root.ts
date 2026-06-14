import type { DomainEvent } from "./domain-event";

export abstract class AggregateRoot {
  private readonly domainEvents: DomainEvent<unknown>[] = [];

  protected addEvent(event: DomainEvent<unknown>): void {
    this.domainEvents.push(event);
  }

  public pullEvents(): DomainEvent<unknown>[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;

    return events;
  }
}
