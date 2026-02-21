import { Request, Response, NextFunction } from 'express';

export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

export class LoggerMiddleware {
  private static logs: LogEntry[] = [];
  private static maxLogs = 1000; // Keep last 1000 logs in memory

  static requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent')
    };

    // Listen for response finish
    res.on('finish', () => {
      logEntry.statusCode = res.statusCode;
      logEntry.responseTime = Date.now() - startTime;
      
      LoggerMiddleware.addLog(logEntry);
      
      // Console logging for development
      if (process.env.NODE_ENV === 'development') {
        
        console.log(`${logEntry.timestamp} - ${logEntry.method} ${logEntry.url} - ${logEntry.statusCode} - ${logEntry.responseTime}ms`);
      }
    });

    // Listen for response error
    res.on('error', (error) => {
      logEntry.error = error.message;
      logEntry.statusCode = 500;
      logEntry.responseTime = Date.now() - startTime;
      
      LoggerMiddleware.addLog(logEntry);
      console.error(`${logEntry.timestamp} - ${logEntry.method} ${logEntry.url} - ERROR - ${error.message}`);
    });

    next();
  };

  private static addLog(log: LogEntry): void {
    LoggerMiddleware.logs.push(log);
    
    // Keep only recent logs
    if (LoggerMiddleware.logs.length > LoggerMiddleware.maxLogs) {
      LoggerMiddleware.logs = LoggerMiddleware.logs.slice(-LoggerMiddleware.maxLogs);
    }
  }

  static getLogs(): LogEntry[] {
    return [...LoggerMiddleware.logs];
  }

  static clearLogs(): void {
    LoggerMiddleware.logs = [];
  }

  static getLogsByStatusCode(statusCode: number): LogEntry[] {
    return LoggerMiddleware.logs.filter(log => log.statusCode === statusCode);
  }

  static getErrorLogs(): LogEntry[] {
    return LoggerMiddleware.logs.filter(log => log.statusCode && log.statusCode >= 400);
  }
}
