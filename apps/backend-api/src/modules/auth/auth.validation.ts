import { AppError } from '../../shared/errors/app-error';

const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError('email is required');
  }

  const email = value.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('email must be valid');
  }

  return email;
}

export function normalizePassword(value: unknown) {
  if (typeof value !== 'string') {
    throw new AppError('password is required');
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  return value;
}
