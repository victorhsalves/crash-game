import { DomainError } from "../errors/domain-error";

export class Money {
  private readonly cents: bigint;

  private constructor(cents: bigint) {
    if (cents < 0n) {
      throw new DomainError("Money cannot be negative.");
    }

    this.cents = cents;
  }

  public static fromCents(cents: bigint): Money {
    return new Money(cents);
  }

  public static zero(): Money {
    return new Money(0n);
  }

  public get value(): bigint {
    return this.cents;
  }

  public add(amount: Money): Money {
    return new Money(this.cents + amount.cents);
  }

  public subtract(amount: Money): Money {
    if (this.cents < amount.cents) {
      throw new DomainError("Insufficient balance.");
    }

    return new Money(this.cents - amount.cents);
  }

  public isZero(): boolean {
    return this.cents === 0n;
  }

  public equals(amount: Money): boolean {
    return this.cents === amount.cents;
  }
}
