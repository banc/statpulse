import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  void _next;

  const statusCode = error instanceof AppError ? error.statusCode : 500;

  console.error('🚨 [API]', error);

  res.status(statusCode).json({
    error: error.message || 'Unexpected API error',
  });
}
