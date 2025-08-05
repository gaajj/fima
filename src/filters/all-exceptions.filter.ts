import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exc: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exc instanceof HttpException) {
      status = exc.getStatus();
      const response = exc.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as any).message || JSON.stringify(response);
    }

    this.logger.error(
      `${req.method} ${req.url} -> ${status}`,
      (exc as any).stack,
    );

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      error: message,
    });
  }
}
