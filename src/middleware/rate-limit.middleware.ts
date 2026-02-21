import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimitMiddleware {
  private static store: RateLimitStore = {};

  static create = (windowMs: number, maxRequests: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || 'unknown';
      const now = Date.now();
      
      // Clean up expired entries
      for (const k in RateLimitMiddleware.store) {
        if (RateLimitMiddleware.store[k].resetTime < now) {
          delete RateLimitMiddleware.store[k];
        }
      }

      // Initialize or update rate limit
      if (!RateLimitMiddleware.store[key]) {
        RateLimitMiddleware.store[key] = {
          count: 1,
          resetTime: now + windowMs
        };
      } else {
        RateLimitMiddleware.store[key].count++;
      }

      const current = RateLimitMiddleware.store[key];
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - current.count),
        'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
      });

      // Check if rate limit exceeded
      if (current.count > maxRequests) {
        ResponseUtil.error(
          res,
          429,
          'Too many requests',
          'RATE_LIMIT_EXCEEDED',
          `Rate limit exceeded. Try again in ${Math.ceil((current.resetTime - now) / 1000)} seconds`
        );
        return;
      }

      next();
    };
  };
}

// Pre-configured rate limiters
export const authLimiter = RateLimitMiddleware.create(15 * 60 * 1000, 5); // 5 requests per 15 minutes
export const generalLimiter = RateLimitMiddleware.create(60 * 1000, 100); // 100 requests per minute
