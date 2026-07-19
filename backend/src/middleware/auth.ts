import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/app_error.js';

type TokenPayload = { user_id: string; role: 'admin' | 'staff' | 'customer' };

export const require_auth: RequestHandler = (request, _response, next) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next(new AppError(401, 'unauthorized', 'Authentication required'));

  try {
    request.user = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    next();
  } catch {
    next(new AppError(401, 'invalid_token', 'Invalid or expired token'));
  }
};

export function require_role(...roles: TokenPayload['role'][]): RequestHandler {
  return (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return next(new AppError(403, 'forbidden', 'Insufficient permission'));
    }
    next();
  };
}
