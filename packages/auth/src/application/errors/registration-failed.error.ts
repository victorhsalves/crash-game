import { AuthApplicationError } from "./auth-application.error";

export class RegistrationFailedError extends AuthApplicationError {
  public constructor(message = "Falha ao registrar usuario.") {
    super(message);
  }
}
