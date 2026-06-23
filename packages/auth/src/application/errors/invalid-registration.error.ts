import { AuthApplicationError } from "./auth-application.error";

export class InvalidRegistrationError extends AuthApplicationError {
  public constructor(message = "Dados de registro invalidos.") {
    super(message);
  }
}
