import { Response } from 'express';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/httpStatus';
import { ApiResponse } from '../types/api.types';

export class ResponseHelper {
  static success<T>(
    res: Response,
    data?: T,
    message: string = SUCCESS_MESSAGES.OPERATION_SUCCESS,
    statusCode: number = HTTP_STATUS.OK
  ) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = ERROR_MESSAGES.INTERNAL_ERROR,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error?: string
  ) {
    const response: ApiResponse = {
      success: false,
      error: error || this.getErrorFromStatusCode(statusCode),
      message,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static unauthorized(res: Response, message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
  }

  static forbidden(res: Response, message: string = ERROR_MESSAGES.FORBIDDEN) {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN, 'Forbidden');
  }

  static badRequest(res: Response, message: string = ERROR_MESSAGES.VALIDATION_ERROR) {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, 'Bad Request');
  }

  static notFound(res: Response, message: string = ERROR_MESSAGES.USER_NOT_FOUND) {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND, 'Not Found');
  }

  static internalError(res: Response, message: string = ERROR_MESSAGES.INTERNAL_ERROR) {
    return this.error(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }

  private static getErrorFromStatusCode(statusCode: number): string {
    switch (statusCode) {
      case HTTP_STATUS.BAD_REQUEST:
        return 'Bad Request';
      case HTTP_STATUS.UNAUTHORIZED:
        return 'Unauthorized';
      case HTTP_STATUS.FORBIDDEN:
        return 'Forbidden';
      case HTTP_STATUS.NOT_FOUND:
        return 'Not Found';
      case HTTP_STATUS.CONFLICT:
        return 'Conflict';
      default:
        return 'Internal Server Error';
    }
  }
}
