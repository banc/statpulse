import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/app-error';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

type AuthTokenPayload = {
  sub: string;
  email: string;
  exp: number;
};

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

function sign(value: string) {
  return createHmac('sha256', env.jwtSecret).update(value).digest('base64url');
}

export function issueAuthToken(user: { id: string; email: string }) {
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = encodeBase64Url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    }),
  );
  const unsignedToken = `${header}.${payload}`;

  return `${unsignedToken}.${sign(unsignedToken)}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const [header, payload, signature] = token.split('.');

  if (!header || !payload || !signature) {
    throw new AppError('Invalid authorization token', 401);
  }

  const expectedSignature = sign(`${header}.${payload}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw new AppError('Invalid authorization token', 401);
  }

  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<AuthTokenPayload>;

  if (!decoded.sub || !decoded.email || !decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new AppError('Invalid authorization token', 401);
  }

  return decoded as AuthTokenPayload;
}
