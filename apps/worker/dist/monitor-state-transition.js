"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonitorStateTransition = getMonitorStateTransition;
const database_1 = require("@statpulse/database");
function getMonitorStateTransition(previousStatus, isUp) {
    const nextStatus = isUp ? database_1.MonitorStatus.UP : database_1.MonitorStatus.DOWN;
    return {
        nextStatus,
        shouldOpenIncident: nextStatus === database_1.MonitorStatus.DOWN && previousStatus !== database_1.MonitorStatus.DOWN,
        shouldCloseIncidents: nextStatus === database_1.MonitorStatus.UP && previousStatus === database_1.MonitorStatus.DOWN,
    };
}
//# sourceMappingURL=monitor-state-transition.js.map