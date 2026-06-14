import { MoneyError } from "./money.error";

export class Money {
  private readonly cents: bigint;

  private constructor(cents: bigint) {
    if (cents < 0n) {
      throw new MoneyError("Money cannot be negative.");
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
      throw new MoneyError("Money cannot be negative.");
    }

    return new Money(this.cents - amount.cents);
  }

  public equals(amount: Money): boolean {
    return this.cents === amount.cents;
  }

  public greaterThan(amount: Money): boolean {
    return this.cents > amount.cents;
  }

  public lessThan(amount: Money): boolean {
    return this.cents < amount.cents;
  }

  public isZero(): boolean {
    return this.cents === 0n;
  }

  public toNumber(): number {
    return Number(this.cents) / 100;
  }

  public toJSON(): string {
    return this.cents.toString();
  }
}
