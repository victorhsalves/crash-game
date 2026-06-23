import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { AuthApplicationError } from "../../application/errors/auth-application.error";
import { InvalidRegistrationError } from "../../application/errors/invalid-registration.error";
import { RegistrationFailedError } from "../../application/errors/registration-failed.error";
import { UserAlreadyExistsError } from "../../application/errors/user-already-exists.error";

interface HttpResponse {
  status(code: number): { json(body: unknown): void };
}

@Catch(AuthApplicationError)
export class AuthApplicationExceptionFilter implements ExceptionFilter {
  public catch(exception: AuthApplicationError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    const status = this.resolveStatus(exception);

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }

  private resolveStatus(exception: AuthApplicationError): number {
    if (exception instanceof UserAlreadyExistsError) {
      return HttpStatus.CONFLICT;
    }

    if (exception instanceof InvalidRegistrationError) {
      return HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof RegistrationFailedError) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
