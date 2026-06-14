import { ApplicationError } from "./application-error";

export class DuplicateTransactionReferenceError extends ApplicationError {
  public constructor(referenceId: string) {
    super(`Transaction with reference ${referenceId} was already processed.`);
  }
}
