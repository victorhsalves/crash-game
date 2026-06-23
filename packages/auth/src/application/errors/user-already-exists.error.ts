import { AuthApplicationError } from "./auth-application.error";

export class UserAlreadyExistsError extends AuthApplicationError {
  public constructor() {
    super("Usuario ou email ja existe.");
  }
}
