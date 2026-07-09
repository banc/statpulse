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
export declare function shouldSkipForCooldown(channel: Pick<DeliverableAlertChannel, 'cooldownSeconds' | 'lastSentAt'>, now: Date): boolean;
export declare function formatAlertMessage(event: AlertEvent): string;
