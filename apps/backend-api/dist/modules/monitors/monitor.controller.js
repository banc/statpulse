"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMonitorsController = listMonitorsController;
exports.createMonitorController = createMonitorController;
exports.listMonitorResultsController = listMonitorResultsController;
exports.listMonitorIncidentsController = listMonitorIncidentsController;
exports.updateMonitorController = updateMonitorController;
exports.deleteMonitorController = deleteMonitorController;
const monitor_service_1 = require("./monitor.service");
async function listMonitorsController(_req, res) {
    const monitors = await (0, monitor_service_1.listMonitors)();
    res.json({ data: monitors });
}
async function createMonitorController(req, res) {
    const monitor = await (0, monitor_service_1.createHttpMonitor)({
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
    const results = await (0, monitor_service_1.getMonitorResults)({
        monitorId: req.params.id,
        limit: req.query.limit,
    });
    res.json({ data: results });
}
async function listMonitorIncidentsController(req, res) {
    const incidents = await (0, monitor_service_1.getMonitorIncidents)({
        monitorId: req.params.id,
        limit: req.query.limit,
    });
    res.json({ data: incidents });
}
async function updateMonitorController(req, res) {
    const monitor = await (0, monitor_service_1.updateHttpMonitor)(req.params.id, {
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
    await (0, monitor_service_1.removeHttpMonitor)(req.params.id);
    res.status(204).send();
}
//# sourceMappingURL=monitor.controller.js.map