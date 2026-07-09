"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMonitorsController = listMonitorsController;
exports.createMonitorController = createMonitorController;
exports.listMonitorResultsController = listMonitorResultsController;
exports.listMonitorIncidentsController = listMonitorIncidentsController;
exports.listMonitorMetricsController = listMonitorMetricsController;
exports.updateMonitorController = updateMonitorController;
exports.deleteMonitorController = deleteMonitorController;
const auth_middleware_1 = require("../auth/auth.middleware");
const monitor_service_1 = require("./monitor.service");
async function listMonitorsController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    const monitors = await (0, monitor_service_1.listMonitors)(auth.userId);
    res.json({ data: monitors });
}
async function createMonitorController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    const monitor = await (0, monitor_service_1.createHttpMonitor)({
        userId: auth.userId,
        name: req.body.name,
        url: req.body.url,
        method: req.body.method,
        expectedStatus: req.body.expectedStatus,
        intervalSeconds: req.body.intervalSeconds,
        timeoutMs: req.body.timeoutMs,
    });
    res.status(201).json({ data: monitor });
}
async function listMonitorResultsController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    const results = await (0, monitor_service_1.getMonitorResults)({
        userId: auth.userId,
        monitorId: req.params.id,
        limit: req.query.limit,
    });
    res.json({ data: results });
}
async function listMonitorIncidentsController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    const incidents = await (0, monitor_service_1.getMonitorIncidents)({
        userId: auth.userId,
        monitorId: req.params.id,
        limit: req.query.limit,
    });
    res.json({ data: incidents });
}
async function listMonitorMetricsController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    const metrics = await (0, monitor_service_1.getMonitorMetrics)({
        userId: auth.userId,
        monitorId: req.params.id,
        from: req.query.from,
        to: req.query.to,
        bucketSeconds: req.query.bucketSeconds,
    });
    res.json({ data: metrics });
}
async function updateMonitorController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    const monitor = await (0, monitor_service_1.updateHttpMonitor)(auth.userId, req.params.id, {
        name: req.body.name,
        url: req.body.url,
        method: req.body.method,
        expectedStatus: req.body.expectedStatus,
        intervalSeconds: req.body.intervalSeconds,
        timeoutMs: req.body.timeoutMs,
        isActive: req.body.isActive,
    });
    res.json({ data: monitor });
}
async function deleteMonitorController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    await (0, monitor_service_1.removeHttpMonitor)(auth.userId, req.params.id);
    res.status(204).send();
}
//# sourceMappingURL=monitor.controller.js.map