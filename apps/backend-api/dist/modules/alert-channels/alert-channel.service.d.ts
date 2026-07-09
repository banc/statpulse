import { AlertChannelType } from '@statpulse/database';
export declare function listAlertChannels(userId: string): Promise<{
    id: string;
    type: AlertChannelType;
    name: string;
    isEnabled: boolean;
    cooldownSeconds: number;
    lastSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    config: {
        chatId: unknown;
        botTokenConfigured: boolean;
        email?: undefined;
    } | {
        email: unknown;
        chatId?: undefined;
        botTokenConfigured?: undefined;
    };
}[]>;
export declare function createUserAlertChannel(input: {
    userId: string;
    type: unknown;
    name: unknown;
    config: unknown;
    cooldownSeconds: unknown;
}): Promise<{
    id: string;
    type: AlertChannelType;
    name: string;
    isEnabled: boolean;
    cooldownSeconds: number;
    lastSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    config: {
        chatId: unknown;
        botTokenConfigured: boolean;
        email?: undefined;
    } | {
        email: unknown;
        chatId?: undefined;
        botTokenConfigured?: undefined;
    };
}>;
export declare function updateUserAlertChannel(userId: string, id: string, input: {
    name?: unknown;
    config?: unknown;
    isEnabled?: unknown;
    cooldownSeconds?: unknown;
}): Promise<{
    id: string;
    type: AlertChannelType;
    name: string;
    isEnabled: boolean;
    cooldownSeconds: number;
    lastSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    config: {
        chatId: unknown;
        botTokenConfigured: boolean;
        email?: undefined;
    } | {
        email: unknown;
        chatId?: undefined;
        botTokenConfigured?: undefined;
    };
}>;
export declare function removeUserAlertChannel(userId: string, id: string): Promise<void>;
export declare function getAlertDeliveryLogs(input: {
    userId: string;
    limit: unknown;
}): Promise<{
    id: string;
    createdAt: Date;
    alertChannelId: string;
    monitorId: string;
    incidentId: string;
    eventType: string;
    status: import("@statpulse/database").AlertDeliveryStatus;
    message: string | null;
    providerResponse: string | null;
}[]>;
