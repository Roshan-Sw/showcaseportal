import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (request.file && request.file.path && fs.existsSync(request.file.path)) {
      fs.unlinkSync(request.file.path);
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const data =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message =
      typeof data === 'object' && data && 'message' in data
        ? data.message
        : data;

    response.status(status).json({
      status: 'error',
      statusCode: status,
      data,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
