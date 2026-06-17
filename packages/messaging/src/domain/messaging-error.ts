export class MessagingError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "MessagingError";
  }
}
