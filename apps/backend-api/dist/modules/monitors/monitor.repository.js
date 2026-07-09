"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserMonitorsWithLatestResult = listUserMonitorsWithLatestResult;
exports.createMonitor = createMonitor;
exports.updateMonitor = updateMonitor;
exports.findUserMonitorById = findUserMonitorById;
exports.deleteMonitor = deleteMonitor;
exports.listMonitorResults = listMonitorResults;
exports.listMonitorIncidents = listMonitorIncidents;
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