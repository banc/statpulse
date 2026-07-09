export type CreateMonitorData = {
    userId: string;
    name?: string;
    url: string;
    method: 'GET' | 'HEAD';
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
};
export type UpdateMonitorData = {
    name?: string | null;
    url?: string;
    method?: 'GET' | 'HEAD';
    expectedStatus?: number;
    intervalSeconds?: number;
    timeoutMs?: number;
    isActive?: boolean;
};
export declare function listUserMonitorsWithLatestResult(userId: string): import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").PrismaPromise<({
    results: {
        id: string;
        createdAt: Date;
        monitorId: string;
        responseTimeMs: number;
        statusCode: number | null;
        isUp: boolean;
        errorMessage: string | null;
    }[];
} & {
    id: string;
    createdAt: Date;
    name: string | null;
    userId: string;
    url: string;
    type: import("@statpulse/database").MonitorType;
    method: import("@statpulse/database").HttpMethod;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    status: import("@statpulse/database").MonitorStatus;
    isActive: boolean;
    lastCheckedAt: Date | null;
})[]>;
export declare function createMonitor(data: CreateMonitorData): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__MonitorClient<{
    id: string;
    createdAt: Date;
    name: string | null;
    userId: string;
    url: string;
    type: import("@statpulse/database").MonitorType;
    method: import("@statpulse/database").HttpMethod;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    status: import("@statpulse/database").MonitorStatus;
    isActive: boolean;
    lastCheckedAt: Date | null;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function updateMonitor(id: string, data: UpdateMonitorData): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__MonitorClient<{
    id: string;
    createdAt: Date;
    name: string | null;
    userId: string;
    url: string;
    type: import("@statpulse/database").MonitorType;
    method: import("@statpulse/database").HttpMethod;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    status: import("@statpulse/database").MonitorStatus;
    isActive: boolean;
    lastCheckedAt: Date | null;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function deleteMonitor(id: string): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__MonitorClient<{
    id: string;
    createdAt: Date;
    name: string | null;
    userId: string;
    url: string;
    type: import("@statpulse/database").MonitorType;
    method: import("@statpulse/database").HttpMethod;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    status: import("@statpulse/database").MonitorStatus;
    isActive: boolean;
    lastCheckedAt: Date | null;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function listMonitorResults(monitorId: string, limit: number): import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").PrismaPromise<{
    id: string;
    createdAt: Date;
    monitorId: string;
    responseTimeMs: number;
    statusCode: number | null;
    isUp: boolean;
    errorMessage: string | null;
}[]>;
export declare function listMonitorIncidents(monitorId: string, limit: number): import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").PrismaPromise<{
    id: string;
    createdAt: Date;
    monitorId: string;
    startedAt: Date;
    resolvedAt: Date | null;
    reason: string | null;
    updatedAt: Date;
}[]>;
export declare function listActiveMonitorSchedulerData(): import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").PrismaPromise<{
    id: string;
    url: string;
    method: import("@statpulse/database").HttpMethod;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    isActive: boolean;
}[]>;
