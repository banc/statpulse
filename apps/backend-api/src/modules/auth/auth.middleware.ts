import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../shared/errors/app-error';
import { verifyAuthToken } from './token.service';

export type AuthContext = {
  userId: string;
  email: string;
};

export type AuthenticatedRequest = Request & {
  auth: AuthContext;
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.header('authorization');
  const [scheme, token] = authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authorization token is required', 401);
  }

  const payload = verifyAuthToken(token);

  (req as AuthenticatedRequest).auth = {
    userId: payload.sub,
    email: payload.email,
  };

  next();
}

export function getAuthContext(req: Request) {
  const auth = (req as Partial<AuthenticatedRequest>).auth;

  if (!auth) {
    throw new AppError('Authorization token is required', 401);
  }

  return auth;
}
