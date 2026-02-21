import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ResponseUtil } from '../utils/response.util';

export class ValidationMiddleware {
  static validate = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.body);
        next();
      } catch (error: unknown) {
        if (error instanceof ZodError) {
          const errors = error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }));
          
          ResponseUtil.validationError(
            res, 
            'Validation failed', 
            `${errors.length} validation error(s) found`
          );
        } else {
          ResponseUtil.badRequest(res, 'Invalid request data');
        }
      }
    };
  };

  static validateParams = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.params);
        next();
      } catch (error: unknown) {
        if (error instanceof ZodError) {
          const errors = error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }));
          
          ResponseUtil.validationError(
            res, 
            'Parameter validation failed', 
            `${errors.length} validation error(s) found`
          );
        } else {
          ResponseUtil.badRequest(res, 'Invalid request parameters');
        }
      }
    };
  };

  static validateQuery = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.query);
        next();
      } catch (error: unknown) {
        if (error instanceof ZodError) {
          const errors = error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }));
          
          ResponseUtil.validationError(
            res, 
            'Query validation failed', 
            `${errors.length} validation error(s) found`
          );
        } else {
          ResponseUtil.badRequest(res, 'Invalid query parameters');
        }
      }
    };
  };
}
