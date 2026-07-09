import { prisma } from '@statpulse/database';

export type CreateMonitorData = {
  userId: string;
  name?: string;
  url: string;
  method: 'GET' | 'HEAD';
  expectedStatus: number;
  intervalSeconds: number;
  timeoutMs: number;
};

export type UpdateMonitorData = {
  name?: string | null;
  url?: string;
  method?: 'GET' | 'HEAD';
  expectedStatus?: number;
  intervalSeconds?: number;
  timeoutMs?: number;
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

export function listMonitorIncidents(monitorId: string, limit: number) {
  return prisma.incident.findMany({
    where: { monitorId },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}

export function listActiveMonitorSchedulerData() {
  return prisma.monitor.findMany({
    where: { isActive: true },
    select: {
      id: true,
      url: true,
      method: true,
      expectedStatus: true,
      intervalSeconds: true,
      timeoutMs: true,
      isActive: true,
    },
  });
}
