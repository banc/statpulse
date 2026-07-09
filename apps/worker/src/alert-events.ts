import { AlertChannelType } from '@statpulse/database';

export type AlertEventType = 'INCIDENT_OPENED' | 'INCIDENT_RESOLVED';

export type AlertEvent = {
  type: AlertEventType;
  userId: string;
  monitorId: string;
  monitorName: string | null;
  monitorUrl: string;
  incidentId: string;
  reason: string | null;
  occurredAt: Date;
};

export type DeliverableAlertChannel = {
  id: string;
  type: AlertChannelType;
  name: string;
  config: unknown;
  cooldownSeconds: number;
  lastSentAt: Date | null;
};

export function shouldSkipForCooldown(channel: Pick<DeliverableAlertChannel, 'cooldownSeconds' | 'lastSentAt'>, now: Date) {
  if (!channel.lastSentAt) {
    return false;
  }

  return now.getTime() - channel.lastSentAt.getTime() < channel.cooldownSeconds * 1000;
}

export function formatAlertMessage(event: AlertEvent) {
  const label = event.type === 'INCIDENT_OPENED' ? 'DOWN' : 'RESOLVED';
  const title = event.monitorName || event.monitorUrl;
  const reason = event.reason ? `\nReason: ${event.reason}` : '';

  return `[StatPulse] ${label}: ${title}\nURL: ${event.monitorUrl}\nTime: ${event.occurredAt.toISOString()}${reason}`;
}
