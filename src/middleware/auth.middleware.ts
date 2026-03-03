import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ResponseUtil } from '../utils/response.util';

interface DecodedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedToken;
}

export class AuthMiddleware {
  static authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        ResponseUtil.unauthorized(res, 'No token provided', 'Authorization header is required');
        return;
      }

      const token = authHeader.split(' ')[1]; // Bearer <token>
      
      if (!token) {
        ResponseUtil.unauthorized(res, 'Invalid token format', 'Token must be in "Bearer <token>" format');
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        ResponseUtil.unauthorized(res, 'Token expired', 'Please login again');
      } else if (error instanceof jwt.JsonWebTokenError) {
        ResponseUtil.unauthorized(res, 'Invalid token', 'Token is not valid');
      } else {
        ResponseUtil.internalError(res, 'Authentication failed', 'Unknown authentication error');
      }
    }
  };

  static optional = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    try {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        req.user = decoded;
      }
    } catch (error) {
      // Optional auth - don't block request if token is invalid
    }
    
    next();
  };
}
