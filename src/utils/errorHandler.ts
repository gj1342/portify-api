import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from './responseHelper';
import { ERROR_MESSAGES } from '../constants/httpStatus';
import { CONSOLE_MESSAGES } from '../constants';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const globalErrorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(CONSOLE_MESSAGES.GLOBAL_ERROR, error);

  if (error instanceof AppError) {
    return ResponseHelper.error(
      res,
      error.message,
      error.statusCode,
      error.name
    );
  }

  if (error.name === 'ValidationError') {
    return ResponseHelper.badRequest(res, ERROR_MESSAGES.VALIDATION_ERROR);
  }

  if (error.name === 'CastError') {
    return ResponseHelper.badRequest(res, 'Invalid ID format');
  }

  if (error.name === 'MongoError' && (error as any).code === 11000) {
    return ResponseHelper.error(
      res,
      'Duplicate field value',
      400,
      'Validation Error'
    );
  }

  if (error.name === 'JsonWebTokenError') {
    return ResponseHelper.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
  }

  if (error.name === 'TokenExpiredError') {
    return ResponseHelper.unauthorized(res, 'Token expired');
  }

  return ResponseHelper.internalError(res, ERROR_MESSAGES.INTERNAL_ERROR);
};
