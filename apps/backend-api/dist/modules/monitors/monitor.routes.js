"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorRouter = void 0;
const express_1 = require("express");
const async_handler_1 = require("../../shared/http/async-handler");
const monitor_controller_1 = require("./monitor.controller");
exports.monitorRouter = (0, express_1.Router)();
exports.monitorRouter.get('/', (0, async_handler_1.asyncHandler)(monitor_controller_1.listMonitorsController));
exports.monitorRouter.post('/', (0, async_handler_1.asyncHandler)(monitor_controller_1.createMonitorController));
exports.monitorRouter.get('/:id/results', (0, async_handler_1.asyncHandler)(monitor_controller_1.listMonitorResultsController));
exports.monitorRouter.patch('/:id', (0, async_handler_1.asyncHandler)(monitor_controller_1.updateMonitorController));
exports.monitorRouter.delete('/:id', (0, async_handler_1.asyncHandler)(monitor_controller_1.deleteMonitorController));
//# sourceMappingURL=monitor.routes.js.map