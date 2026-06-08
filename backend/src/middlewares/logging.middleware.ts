/**
 * Request Logging Middleware
 * Logs all incoming requests with method, path, status, and response time
 * Adds unique request ID for tracking and debugging
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

// ISO timestamp formatter
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// Log level type
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Simple logger function
function log(level: LogLevel, message: string, data?: Record<string, any>): void {
  const timestamp = getCurrentTimestamp();
  const logLevel = level.toUpperCase().padEnd(5);
  const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
  console.log(`[${timestamp}] [${logLevel}] ${message}${dataStr}`);
}

export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate and attach unique request ID
  const requestId = uuidv4();
  req.requestId = requestId;

  // Record request start time
  const startTime = Date.now();

  // Log incoming request
  log('info', `Incoming ${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')?.substring(0, 50),
  });

  // Intercept response to log after it's sent
  const originalSend = res.send;
  res.send = function (data: any): Response {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const statusCode = res.statusCode;

    // Determine log level based on status code
    let logLevel: LogLevel = 'info';
    if (statusCode >= 500) logLevel = 'error';
    else if (statusCode >= 400) logLevel = 'warn';

    log(logLevel, `Response ${req.method} ${req.path}`, {
      requestId,
      statusCode,
      duration: `${duration}ms`,
      method: req.method,
      path: req.path,
    });

    return originalSend.call(this, data);
  };

  next();
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Add request ID to response headers for client tracking
  if (req.requestId) {
    res.setHeader('X-Request-ID', req.requestId);
  }
  next();
}
