import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    let message: string;

    if (
      typeof errorResponse === 'object' &&
      errorResponse.hasOwnProperty('message')
    ) {
      message = errorResponse['message'];
    } else {
      message = 'Internal Server Error';
    }

    const error = {
      status: status,
      error: true,
      message: message,
    };

    response.status(status).json(error);
  }
}
