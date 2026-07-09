import { MonitorStatus } from '@statpulse/database';
export type MonitorStateTransition = {
    nextStatus: MonitorStatus;
    shouldOpenIncident: boolean;
    shouldCloseIncidents: boolean;
};
export declare function getMonitorStateTransition(previousStatus: MonitorStatus, isUp: boolean): MonitorStateTransition;
