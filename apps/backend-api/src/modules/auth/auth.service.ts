import { AppError } from '../../shared/errors/app-error';
import { createUser, findUserByEmail, findUserById } from './auth.repository';
import { hashPassword, verifyPassword } from './password.service';
import { issueAuthToken } from './token.service';
import { normalizeEmail, normalizePassword } from './auth.validation';

function toAuthResponse(user: { id: string; email: string; createdAt: Date }) {
  return {
    user,
    token: issueAuthToken(user),
  };
}

export async function registerUser(input: { email: unknown; password: unknown }) {
  const email = normalizeEmail(input.email);
  const password = normalizePassword(input.password);

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError('email is already registered', 409);
  }

  const user = await createUser({
    email,
    passwordHash: await hashPassword(password),
  });

  return toAuthResponse(user);
}

export async function loginUser(input: { email: unknown; password: unknown }) {
  const email = normalizeEmail(input.email);
  const password = normalizePassword(input.password);
  const user = await findUserByEmail(email);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError('Invalid email or password', 401);
  }

  return toAuthResponse({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  });
}

export async function getCurrentUser(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 401);
  }

  return user;
}
