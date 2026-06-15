import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { DomainError } from "../../domain/errors/domain-error";

interface HttpResponse {
  status(code: number): { json(body: unknown): void };
}

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  public catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    const status = HttpStatus.UNPROCESSABLE_ENTITY;

    response.status(status).json({
      statusCode: status,
      error: exception.constructor.name,
      message: exception.message,
    });
  }
}
