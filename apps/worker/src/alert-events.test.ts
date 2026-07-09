import { describe, expect, it } from 'vitest';
import { formatAlertMessage, shouldSkipForCooldown } from './alert-events';

describe('alert events', () => {
  it('formats opened incident messages', () => {
    expect(
      formatAlertMessage({
        type: 'INCIDENT_OPENED',
        userId: 'user-1',
        monitorId: 'monitor-1',
        monitorName: 'API',
        monitorUrl: 'https://api.example.com/',
        incidentId: 'incident-1',
        reason: 'Timeout',
        occurredAt: new Date('2026-07-09T10:00:00.000Z'),
      }),
    ).toBe('[StatPulse] DOWN: API\nURL: https://api.example.com/\nTime: 2026-07-09T10:00:00.000Z\nReason: Timeout');
  });

  it('formats resolved incident messages without a reason', () => {
    expect(
      formatAlertMessage({
        type: 'INCIDENT_RESOLVED',
        userId: 'user-1',
        monitorId: 'monitor-1',
        monitorName: null,
        monitorUrl: 'https://api.example.com/',
        incidentId: 'incident-1',
        reason: null,
        occurredAt: new Date('2026-07-09T10:05:00.000Z'),
      }),
    ).toBe('[StatPulse] RESOLVED: https://api.example.com/\nURL: https://api.example.com/\nTime: 2026-07-09T10:05:00.000Z');
  });

  it('detects active cooldown windows', () => {
    expect(
      shouldSkipForCooldown(
        {
          cooldownSeconds: 300,
          lastSentAt: new Date('2026-07-09T10:00:00.000Z'),
        },
        new Date('2026-07-09T10:04:00.000Z'),
      ),
    ).toBe(true);
  });

  it('allows delivery after cooldown expires', () => {
    expect(
      shouldSkipForCooldown(
        {
          cooldownSeconds: 300,
          lastSentAt: new Date('2026-07-09T10:00:00.000Z'),
        },
        new Date('2026-07-09T10:05:00.000Z'),
      ),
    ).toBe(false);
  });
});
