import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { ApplicationError } from "../../application/errors/application-error";
import { CurrentRoundNotFoundError } from "../../application/errors/current-round-not-found.error";

interface HttpResponse {
  status(code: number): { json(body: unknown): void };
}

@Catch(ApplicationError)
export class ApplicationExceptionFilter implements ExceptionFilter {
  public catch(exception: ApplicationError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    const status = this.resolveStatus(exception);

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }

  private resolveStatus(exception: ApplicationError): number {
    if (exception instanceof CurrentRoundNotFoundError) {
      return HttpStatus.NOT_FOUND;
    }

    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
