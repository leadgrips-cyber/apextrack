import jwt, { type JwtPayload, type Secret, type SignOptions } from 'jsonwebtoken';
import { jwtConfig } from "../config/jwt.js";
import { AuthTokenPayload, UserRole } from "../types/auth.js";

export function signJwt(payload: Omit<AuthTokenPayload, 'issuedAt' | 'expiresAt'>) {
  const options: any = {
    expiresIn: jwtConfig.expiresIn,
  };
  return jwt.sign(payload, jwtConfig.secret as Secret, options);
}

export function verifyJwt(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, jwtConfig.secret as Secret) as JwtPayload;

  if (!decoded || typeof decoded !== 'object' || !decoded.sub || !decoded.role || !decoded.email) {
    throw new Error('Invalid authentication token');
  }

  return {
    sub: decoded.sub as string,
    role: decoded.role as UserRole,
    email: decoded.email as string,
    issuedAt: decoded.iat as number,
    expiresAt: decoded.exp as number,
  };
}
