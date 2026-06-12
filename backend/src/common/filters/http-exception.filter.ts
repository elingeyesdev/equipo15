import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? (exception.getResponse() as
            | string
            | {
                message?: string | string[];
                error?: string;
                details?: Record<string, string>;
              })
        : {
            message:
              exception instanceof Error
                ? exception.message
                : 'Internal server error',
          };

    let message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message.join(', ')
          : exceptionResponse.message || exceptionResponse.error || 'Error';

    if (status === 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
      );

      if (process.env['NODE_ENV'] === 'production') {
        message =
          'Ha ocurrido un error interno. Por favor, inténtalo más tarde.';
      }
    } else if (status === 400) {
      this.logger.warn(`[400 Bad Request] ${request.url} - ${message}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: message,
      details:
        typeof exceptionResponse === 'string'
          ? undefined
          : exceptionResponse.details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
