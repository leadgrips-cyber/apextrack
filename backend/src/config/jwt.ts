/**
 * JWT Configuration
 * CRITICAL: JWT_SECRET MUST be set in environment variables
 * Never use default/hardcoded secrets in production
 */

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error(
    'CRITICAL: JWT_SECRET environment variable is not set. ' +
    'This is required for token signing and verification. ' +
    'Please set JWT_SECRET in your .env file and restart the server.'
  );
}

export const jwtConfig: { secret: string; expiresIn: string } = {
  secret,
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
};
