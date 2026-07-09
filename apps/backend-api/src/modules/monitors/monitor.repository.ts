import { Prisma, prisma } from '@statpulse/database';

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

export function findUserMonitorById(userId: string, monitorId: string) {
  return prisma.monitor.findFirst({
    where: {
      id: monitorId,
      userId,
    },
  });
}

export function deleteMonitor(id: string) {
  return prisma.monitor.delete({
    where: { id },
  });
}

export function listMonitorResults(userId: string, monitorId: string, limit: number) {
  return prisma.monitorResult.findMany({
    where: {
      monitorId,
      monitor: {
        userId,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export function listMonitorIncidents(userId: string, monitorId: string, limit: number) {
  return prisma.incident.findMany({
    where: {
      monitorId,
      monitor: {
        userId,
      },
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}

export type MonitorMetricsBucket = {
  bucketStart: Date;
  checkCount: number;
  avgResponseTimeMs: number | null;
  minResponseTimeMs: number | null;
  maxResponseTimeMs: number | null;
  availability: number | null;
};

export function listMonitorMetricsBuckets(input: {
  userId: string;
  monitorId: string;
  from: Date;
  to: Date;
  bucketSeconds: number;
}) {
  return prisma.$queryRaw<MonitorMetricsBucket[]>`
    SELECT
      time_bucket(make_interval(secs => ${input.bucketSeconds}), r."createdAt") AS "bucketStart",
      COUNT(*)::INTEGER AS "checkCount",
      AVG(r."responseTimeMs")::DOUBLE PRECISION AS "avgResponseTimeMs",
      MIN(r."responseTimeMs")::INTEGER AS "minResponseTimeMs",
      MAX(r."responseTimeMs")::INTEGER AS "maxResponseTimeMs",
      AVG(CASE WHEN r."isUp" THEN 1.0 ELSE 0.0 END)::DOUBLE PRECISION AS "availability"
    FROM "MonitorResult" r
    INNER JOIN "Monitor" m ON m."id" = r."monitorId"
    WHERE
      r."monitorId" = ${input.monitorId}
      AND m."userId" = ${input.userId}
      AND r."createdAt" >= ${input.from}
      AND r."createdAt" < ${input.to}
    GROUP BY "bucketStart"
    ORDER BY "bucketStart" ASC
  `;
}

export function buildContinuousMetricsRefreshQuery(from: Date, to: Date) {
  return Prisma.sql`
    CALL refresh_continuous_aggregate(
      '"MonitorResultFiveMinuteMetrics"',
      ${from},
      ${to}
    )
  `;
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
