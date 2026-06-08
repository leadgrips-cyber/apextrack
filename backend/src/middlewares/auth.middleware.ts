import { NextFunction, Response } from 'express';
import { verifyJwt } from "../utils/jwt.js";
import { AuthRequest } from "../types/auth.js";

export async function authenticateJwt(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    const token = authorization.slice(7).trim();
    const payload = verifyJwt(token);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', details: (error as Error).message });
  }
}
