"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserMonitorsWithLatestResult = listUserMonitorsWithLatestResult;
exports.createMonitor = createMonitor;
exports.updateMonitor = updateMonitor;
exports.findUserMonitorById = findUserMonitorById;
exports.deleteMonitor = deleteMonitor;
exports.listMonitorResults = listMonitorResults;
exports.listMonitorIncidents = listMonitorIncidents;
exports.listMonitorMetricsBuckets = listMonitorMetricsBuckets;
exports.buildContinuousMetricsRefreshQuery = buildContinuousMetricsRefreshQuery;
exports.listActiveMonitorSchedulerData = listActiveMonitorSchedulerData;
const database_1 = require("@statpulse/database");
function listUserMonitorsWithLatestResult(userId) {
    return database_1.prisma.monitor.findMany({
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
function createMonitor(data) {
    return database_1.prisma.monitor.create({
        data: {
            ...data,
            isActive: true,
        },
    });
}
function updateMonitor(id, data) {
    return database_1.prisma.monitor.update({
        where: { id },
        data,
    });
}
function findUserMonitorById(userId, monitorId) {
    return database_1.prisma.monitor.findFirst({
        where: {
            id: monitorId,
            userId,
        },
    });
}
function deleteMonitor(id) {
    return database_1.prisma.monitor.delete({
        where: { id },
    });
}
function listMonitorResults(userId, monitorId, limit) {
    return database_1.prisma.monitorResult.findMany({
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
function listMonitorIncidents(userId, monitorId, limit) {
    return database_1.prisma.incident.findMany({
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
function listMonitorMetricsBuckets(input) {
    return database_1.prisma.$queryRaw `
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
function buildContinuousMetricsRefreshQuery(from, to) {
    return database_1.Prisma.sql `
    CALL refresh_continuous_aggregate(
      '"MonitorResultFiveMinuteMetrics"',
      ${from},
      ${to}
    )
  `;
}
function listActiveMonitorSchedulerData() {
    return database_1.prisma.monitor.findMany({
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
//# sourceMappingURL=monitor.repository.js.map