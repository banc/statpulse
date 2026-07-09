"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerIdForMonitor = schedulerIdForMonitor;
exports.enqueueImmediateMonitorCheck = enqueueImmediateMonitorCheck;
exports.scheduleMonitor = scheduleMonitor;
exports.removeMonitorScheduler = removeMonitorScheduler;
const monitor_queue_1 = require("../../infrastructure/queues/monitor-queue");
function schedulerIdForMonitor(monitorId) {
    return `monitor-${monitorId}`;
}
async function enqueueImmediateMonitorCheck(monitor) {
    await monitor_queue_1.monitorQueue.add('ping-job', {
        monitorId: monitor.id,
        url: monitor.url,
        method: monitor.method,
        expectedStatus: monitor.expectedStatus,
        timeoutMs: monitor.timeoutMs,
    }, {
        jobId: `manual-${monitor.id}-${Date.now()}`,
        removeOnComplete: 100,
        removeOnFail: 100,
    });
}
async function scheduleMonitor(monitor) {
    const schedulerId = schedulerIdForMonitor(monitor.id);
    if (!monitor.isActive) {
        await removeMonitorScheduler(monitor.id);
        return;
    }
    await monitor_queue_1.monitorQueue.upsertJobScheduler(schedulerId, { every: monitor.intervalSeconds * 1000 }, {
        name: 'ping-job',
        data: {
            monitorId: monitor.id,
            url: monitor.url,
            method: monitor.method,
            expectedStatus: monitor.expectedStatus,
            timeoutMs: monitor.timeoutMs,
        },
        opts: {
            removeOnComplete: 100,
            removeOnFail: 100,
        },
    });
}
async function removeMonitorScheduler(monitorId) {
    await monitor_queue_1.monitorQueue.removeJobScheduler(schedulerIdForMonitor(monitorId));
}
//# sourceMappingURL=monitor-scheduler.service.js.map