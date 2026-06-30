import { prisma } from '@statpulse/database';
import { env } from '../../config/env';

export async function ensureDevUser() {
  return prisma.user.upsert({
    where: { email: env.devUserEmail },
    update: {},
    create: {
      email: env.devUserEmail,
      passwordHash: 'dev-only-password-placeholder',
    },
  });
}
