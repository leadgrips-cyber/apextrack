/**
 * Security Middleware
 * Adds security headers and enforces security policies
 * Includes HSTS, X-Content-Type-Options, X-Frame-Options, etc.
 */

import { Request, Response, NextFunction } from 'express';

export function securityHeadersMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (permissive for API)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );

  // HSTS (HTTP Strict Transport Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  // Remove server header to avoid leaking version info
  res.removeHeader('Server');
  res.setHeader('Server', 'ApexTrack/1.0');

  // Allow credentials in CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  next();
}

/**
 * Request size limit middleware
 * Prevents large payload attacks
 */
export function requestSizeLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip size check for multipart uploads — multer enforces per-file limits
  const contentType = req.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    next();
    return;
  }

  const maxSize = 1024 * 100; // 100KB for JSON/form bodies
  const contentLength = parseInt(req.get('content-length') || '0', 10);

  if (contentLength > maxSize) {
    res.status(413).json({
      error: 'Payload too large',
      message: `Request body exceeds maximum size of ${maxSize / 1024}KB`,
      maxSize,
      received: contentLength,
    });
    return;
  }

  next();
}

/**
 * Rate limiting status middleware
 * Prepares for rate limiting implementation
 */
export function rateLimitingStatusMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Add rate limit headers to all responses
  // In production, these would be set by an actual rate limiting middleware
  res.setHeader('X-RateLimit-Limit', '1000');
  res.setHeader('X-RateLimit-Remaining', '999');
  res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 3600000).toISOString());

  next();
}
