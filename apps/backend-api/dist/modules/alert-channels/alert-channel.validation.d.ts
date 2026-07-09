import { AlertChannelType } from '@statpulse/database';
export type AlertChannelConfig = {
    botToken?: string;
    chatId?: string;
    email?: string;
};
export declare function normalizeAlertChannelType(value: unknown): "TELEGRAM" | "EMAIL";
export declare function normalizeAlertChannelName(value: unknown): string;
export declare function normalizeCooldownSeconds(value: unknown): number;
export declare function normalizeAlertChannelConfig(type: AlertChannelType, value: unknown): AlertChannelConfig;
export declare function normalizeOptionalEnabled(value: unknown): boolean | undefined;
