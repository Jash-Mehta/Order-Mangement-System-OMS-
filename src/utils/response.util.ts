import { Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  success: false;
  message: string;
  error: {
    code: string;
    details: string;
  };
}

export interface SuccessResponse<T = any> {
  statusCode: number;
  success: true;
  message: string;
  data: T;
}

export class ResponseUtil {
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): void {
    const response: SuccessResponse<T> = {
      statusCode,
      success: true,
      message,
      data
    };
    res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message: string = 'Resource created successfully'): void {
    this.success(res, data, message, 201);
  }

  static error(
    res: Response, 
    statusCode: number, 
    message: string, 
    errorCode: string, 
    details?: string
  ): void {
    const response: ErrorResponse = {
      statusCode,
      success: false,
      message,
      error: {
        code: errorCode,
        details: details || message
      }
    };
    res.status(statusCode).json(response);
  }

  static notFound(res: Response, message: string = 'Resource not found', details?: string): void {
    this.error(res, 404, message, 'NOT_FOUND', details || 'No records matched the given criteria');
  }

  static badRequest(res: Response, message: string = 'Bad request', details?: string): void {
    this.error(res, 400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized', details?: string): void {
    this.error(res, 401, message, 'UNAUTHORIZED', details || 'Authentication required');
  }

  static forbidden(res: Response, message: string = 'Forbidden', details?: string): void {
    this.error(res, 403, message, 'FORBIDDEN', details || 'Access denied');
  }

  static internalError(res: Response, message: string = 'Internal server error', details?: string): void {
    this.error(res, 500, message, 'INTERNAL_ERROR', details || 'An unexpected error occurred');
  }

  static validationError(res: Response, message: string = 'Validation failed', details?: string): void {
    this.error(res, 422, message, 'VALIDATION_ERROR', details || 'Input validation failed');
  }

  static conflict(res: Response, message: string = 'Conflict', details?: string): void {
    this.error(res, 409, message, 'CONFLICT', details || 'Resource conflict');
  }
}
