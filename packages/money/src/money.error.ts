export class MoneyError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}
