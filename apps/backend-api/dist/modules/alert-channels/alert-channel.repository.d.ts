import { AlertChannelType } from '@statpulse/database';
import { AlertChannelConfig } from './alert-channel.validation';
export type CreateAlertChannelData = {
    userId: string;
    type: AlertChannelType;
    name: string;
    config: AlertChannelConfig;
    cooldownSeconds: number;
};
export type UpdateAlertChannelData = {
    name?: string;
    config?: AlertChannelConfig;
    isEnabled?: boolean;
    cooldownSeconds?: number;
};
export declare function listUserAlertChannels(userId: string): import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").PrismaPromise<{
    id: string;
    userId: string;
    type: AlertChannelType;
    name: string;
    config: import("@prisma/client/runtime/client").JsonValue;
    isEnabled: boolean;
    cooldownSeconds: number;
    lastSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function createAlertChannel(data: CreateAlertChannelData): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__AlertChannelClient<{
    id: string;
    userId: string;
    type: AlertChannelType;
    name: string;
    config: import("@prisma/client/runtime/client").JsonValue;
    isEnabled: boolean;
    cooldownSeconds: number;
    lastSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function findUserAlertChannelById(userId: string, id: string): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__AlertChannelClient<{
    id: string;
    userId: string;
    type: AlertChannelType;
    name: string;
    config: import("@prisma/client/runtime/client").JsonValue;
    isEnabled: boolean;
    cooldownSeconds: number;
    lastSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
} | null, null, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function updateAlertChannel(id: string, data: UpdateAlertChannelData): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__AlertChannelClient<{
    id: string;
    userId: string;
    type: AlertChannelType;
    name: string;
    config: import("@prisma/client/runtime/client").JsonValue;
    isEnabled: boolean;
    cooldownSeconds: number;
    lastSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function deleteAlertChannel(id: string): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__AlertChannelClient<{
    id: string;
    userId: string;
    type: AlertChannelType;
    name: string;
    config: import("@prisma/client/runtime/client").JsonValue;
    isEnabled: boolean;
    cooldownSeconds: number;
    lastSentAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function listAlertDeliveryLogs(userId: string, limit: number): import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").PrismaPromise<{
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
