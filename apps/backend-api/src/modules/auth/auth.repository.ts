import { prisma } from '@statpulse/database';

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });
}

export function createUser(data: { email: string; passwordHash: string }) {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });
}
