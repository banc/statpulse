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
        statusCode: number | null;
        id: string;
        createdAt: Date;
        monitorId: string;
        responseTimeMs: number;
        isUp: boolean;
        errorMessage: string | null;
    }[];
} & {
    method: import("@statpulse/database").HttpMethod;
    url: string;
    id: string;
    createdAt: Date;
    name: string | null;
    userId: string;
    type: import("@statpulse/database").MonitorType;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    status: import("@statpulse/database").MonitorStatus;
    isActive: boolean;
    lastCheckedAt: Date | null;
})[]>;
export declare function createMonitor(data: CreateMonitorData): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__MonitorClient<{
    method: import("@statpulse/database").HttpMethod;
    url: string;
    id: string;
    createdAt: Date;
    name: string | null;
    userId: string;
    type: import("@statpulse/database").MonitorType;
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
    method: import("@statpulse/database").HttpMethod;
    url: string;
    id: string;
    createdAt: Date;
    name: string | null;
    userId: string;
    type: import("@statpulse/database").MonitorType;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    status: import("@statpulse/database").MonitorStatus;
    isActive: boolean;
    lastCheckedAt: Date | null;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function findUserMonitorById(userId: string, monitorId: string): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__MonitorClient<{
    method: import("@statpulse/database").HttpMethod;
    url: string;
    id: string;
    createdAt: Date;
    name: string | null;
    userId: string;
    type: import("@statpulse/database").MonitorType;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    status: import("@statpulse/database").MonitorStatus;
    isActive: boolean;
    lastCheckedAt: Date | null;
} | null, null, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function deleteMonitor(id: string): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__MonitorClient<{
    method: import("@statpulse/database").HttpMethod;
    url: string;
    id: string;
    createdAt: Date;
    name: string | null;
    userId: string;
    type: import("@statpulse/database").MonitorType;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    status: import("@statpulse/database").MonitorStatus;
    isActive: boolean;
    lastCheckedAt: Date | null;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function listMonitorResults(userId: string, monitorId: string, limit: number): import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").PrismaPromise<{
    statusCode: number | null;
    id: string;
    createdAt: Date;
    monitorId: string;
    responseTimeMs: number;
    isUp: boolean;
    errorMessage: string | null;
}[]>;
export declare function listMonitorIncidents(userId: string, monitorId: string, limit: number): import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").PrismaPromise<{
    id: string;
    createdAt: Date;
    monitorId: string;
    startedAt: Date;
    resolvedAt: Date | null;
    reason: string | null;
    updatedAt: Date;
}[]>;
export declare function listActiveMonitorSchedulerData(): import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").PrismaPromise<{
    method: import("@statpulse/database").HttpMethod;
    url: string;
    id: string;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    isActive: boolean;
}[]>;
