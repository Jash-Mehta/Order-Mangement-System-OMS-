import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ErrorHandler {
  static handleNotFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not found - ${req.originalUrl}`) as AppError;
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
  };

  static handleGlobalError = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (res.headersSent) {
      return next(error);
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';

    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
    }

    ResponseUtil.error(res, statusCode, message, 'INTERNAL_ERROR', error.stack);
  };
}
