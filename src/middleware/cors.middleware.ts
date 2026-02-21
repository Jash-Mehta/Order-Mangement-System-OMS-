import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

export class CorsMiddleware {
  static configure = (options: {
    origin?: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
  } = {}) => {
    const {
      origin = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
      methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders = ['Content-Type', 'Authorization', 'x-razorpay-signature'],
      credentials = true
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
      const requestOrigin = req.headers.origin;
      
      // Allow requests with no origin (like Postman, curl, mobile apps)
      if (!requestOrigin) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', methods.join(', '));
        res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
        res.header('Access-Control-Allow-Credentials', 'false');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          res.status(200).end();
          return;
        }
        
        next();
        return;
      }
      
      // Check if origin is allowed
      let isOriginAllowed = false;
      if (Array.isArray(origin)) {
        isOriginAllowed = origin.includes(requestOrigin as string);
      } else {
        isOriginAllowed = origin === requestOrigin;
      }

      if (!isOriginAllowed) {
        ResponseUtil.error(
          res,
          403,
          'CORS error',
          'CORS_ERROR',
          `Origin ${requestOrigin} not allowed`
        );
        return;
      }

      // Set CORS headers for allowed origins
      res.header('Access-Control-Allow-Origin', requestOrigin);
      res.header('Access-Control-Allow-Methods', methods.join(', '));
      res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.header('Access-Control-Allow-Credentials', credentials.toString());

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      next();
    };
  };
}

// Pre-configured CORS middleware with development-friendly settings
export const defaultCors = CorsMiddleware.configure({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ]
});

// Development CORS that allows all origins
export const devCors = CorsMiddleware.configure({
  origin: '*'
});
