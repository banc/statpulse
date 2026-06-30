"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMonitorsController = listMonitorsController;
exports.createMonitorController = createMonitorController;
exports.listMonitorResultsController = listMonitorResultsController;
exports.updateMonitorController = updateMonitorController;
exports.deleteMonitorController = deleteMonitorController;
const monitor_service_1 = require("./monitor.service");
async function listMonitorsController(_req, res) {
    const monitors = await (0, monitor_service_1.listMonitors)();
    res.json({ data: monitors });
}
async function createMonitorController(req, res) {
    const monitor = await (0, monitor_service_1.createHttpMonitor)({
        url: req.body.url,
        intervalSeconds: req.body.intervalSeconds,
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
async function updateMonitorController(req, res) {
    const monitor = await (0, monitor_service_1.updateHttpMonitor)(req.params.id, {
        url: req.body.url,
        intervalSeconds: req.body.intervalSeconds,
        isActive: req.body.isActive,
    });
    res.json({ data: monitor });
}
async function deleteMonitorController(req, res) {
    await (0, monitor_service_1.removeHttpMonitor)(req.params.id);
    res.status(204).send();
}
//# sourceMappingURL=monitor.controller.js.map