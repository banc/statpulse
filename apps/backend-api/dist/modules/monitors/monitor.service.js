"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMonitors = listMonitors;
exports.createHttpMonitor = createHttpMonitor;
exports.getMonitorResults = getMonitorResults;
exports.updateHttpMonitor = updateHttpMonitor;
exports.removeHttpMonitor = removeHttpMonitor;
exports.syncActiveMonitorSchedulers = syncActiveMonitorSchedulers;
const dev_user_service_1 = require("../dev-users/dev-user.service");
const monitor_repository_1 = require("./monitor.repository");
const monitor_validation_1 = require("./monitor.validation");
const monitor_scheduler_service_1 = require("./monitor-scheduler.service");
async function listMonitors() {
    const user = await (0, dev_user_service_1.ensureDevUser)();
    const monitors = await (0, monitor_repository_1.listUserMonitorsWithLatestResult)(user.id);
    return monitors.map((monitor) => ({
        ...monitor,
        latestResult: monitor.results[0] ?? null,
        results: undefined,
    }));
}
async function createHttpMonitor(input) {
    const user = await (0, dev_user_service_1.ensureDevUser)();
    const monitor = await (0, monitor_repository_1.createMonitor)({
        userId: user.id,
        url: (0, monitor_validation_1.normalizeUrl)(input.url),
        intervalSeconds: (0, monitor_validation_1.normalizeIntervalSeconds)(input.intervalSeconds),
    });
    await (0, monitor_scheduler_service_1.scheduleMonitor)(monitor);
    await (0, monitor_scheduler_service_1.enqueueImmediateMonitorCheck)(monitor);
    return monitor;
}
async function getMonitorResults(input) {
    return (0, monitor_repository_1.listMonitorResults)(input.monitorId, (0, monitor_validation_1.normalizeResultsLimit)(input.limit));
}
async function updateHttpMonitor(monitorId, input) {
    const data = {};
    if (input.url !== undefined) {
        data.url = (0, monitor_validation_1.normalizeUrl)(input.url);
    }
    if (input.intervalSeconds !== undefined) {
        data.intervalSeconds = (0, monitor_validation_1.normalizeIntervalSeconds)(input.intervalSeconds);
    }
    if (input.isActive !== undefined) {
        data.isActive = Boolean(input.isActive);
    }
    const monitor = await (0, monitor_repository_1.updateMonitor)(monitorId, data);
    await (0, monitor_scheduler_service_1.scheduleMonitor)(monitor);
    if (monitor.isActive) {
        await (0, monitor_scheduler_service_1.enqueueImmediateMonitorCheck)(monitor);
    }
    return monitor;
}
async function removeHttpMonitor(monitorId) {
    await (0, monitor_scheduler_service_1.removeMonitorScheduler)(monitorId);
    await (0, monitor_repository_1.deleteMonitor)(monitorId);
}
async function syncActiveMonitorSchedulers() {
    const activeMonitors = await (0, monitor_repository_1.listActiveMonitorSchedulerData)();
    await Promise.all(activeMonitors.map(monitor_scheduler_service_1.scheduleMonitor));
    console.log(`⏰ [Scheduler] Synced ${activeMonitors.length} active monitor(s)`);
}
//# sourceMappingURL=monitor.service.js.map