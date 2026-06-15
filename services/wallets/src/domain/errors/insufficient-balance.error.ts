import { DomainError } from "./domain-error";

export class InsufficientBalanceError extends DomainError {
  public constructor() {
    super("Insufficient balance.");
  }
}
