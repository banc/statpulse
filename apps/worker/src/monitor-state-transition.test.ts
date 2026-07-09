import { MonitorStatus } from '@statpulse/database';
import { describe, expect, it } from 'vitest';
import { getMonitorStateTransition } from './monitor-state-transition';

describe('getMonitorStateTransition', () => {
  it.each([MonitorStatus.UNKNOWN, MonitorStatus.UP])('opens an incident on %s -> DOWN', (previousStatus) => {
    expect(getMonitorStateTransition(previousStatus, false)).toEqual({
      nextStatus: MonitorStatus.DOWN,
      shouldOpenIncident: true,
      shouldCloseIncidents: false,
    });
  });

  it('does not open a duplicate incident on DOWN -> DOWN', () => {
    expect(getMonitorStateTransition(MonitorStatus.DOWN, false)).toEqual({
      nextStatus: MonitorStatus.DOWN,
      shouldOpenIncident: false,
      shouldCloseIncidents: false,
    });
  });

  it('closes open incidents on DOWN -> UP', () => {
    expect(getMonitorStateTransition(MonitorStatus.DOWN, true)).toEqual({
      nextStatus: MonitorStatus.UP,
      shouldOpenIncident: false,
      shouldCloseIncidents: true,
    });
  });

  it.each([MonitorStatus.UNKNOWN, MonitorStatus.UP])('does not close incidents on %s -> UP', (previousStatus) => {
    expect(getMonitorStateTransition(previousStatus, true)).toEqual({
      nextStatus: MonitorStatus.UP,
      shouldOpenIncident: false,
      shouldCloseIncidents: false,
    });
  });
});
