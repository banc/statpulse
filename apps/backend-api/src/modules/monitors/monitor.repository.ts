import { prisma } from '@statpulse/database';

export type CreateMonitorData = {
  userId: string;
  url: string;
  intervalSeconds: number;
};

export type UpdateMonitorData = {
  url?: string;
  intervalSeconds?: number;
  isActive?: boolean;
};

export function listUserMonitorsWithLatestResult(userId: string) {
  return prisma.monitor.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      results: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
}

export function createMonitor(data: CreateMonitorData) {
  return prisma.monitor.create({
    data: {
      ...data,
      isActive: true,
    },
  });
}

export function updateMonitor(id: string, data: UpdateMonitorData) {
  return prisma.monitor.update({
    where: { id },
    data,
  });
}

export function deleteMonitor(id: string) {
  return prisma.monitor.delete({
    where: { id },
  });
}

export function listMonitorResults(monitorId: string, limit: number) {
  return prisma.monitorResult.findMany({
    where: { monitorId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export function listActiveMonitorSchedulerData() {
  return prisma.monitor.findMany({
    where: { isActive: true },
    select: {
      id: true,
      url: true,
      intervalSeconds: true,
      isActive: true,
    },
  });
}
