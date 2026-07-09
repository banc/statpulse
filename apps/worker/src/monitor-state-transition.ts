import { MonitorStatus } from '@statpulse/database';

export type MonitorStateTransition = {
  nextStatus: MonitorStatus;
  shouldOpenIncident: boolean;
  shouldCloseIncidents: boolean;
};

export function getMonitorStateTransition(previousStatus: MonitorStatus, isUp: boolean): MonitorStateTransition {
  const nextStatus = isUp ? MonitorStatus.UP : MonitorStatus.DOWN;

  return {
    nextStatus,
    shouldOpenIncident: nextStatus === MonitorStatus.DOWN && previousStatus !== MonitorStatus.DOWN,
    shouldCloseIncidents: nextStatus === MonitorStatus.UP && previousStatus === MonitorStatus.DOWN,
  };
}
