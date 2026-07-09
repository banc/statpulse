import { Prisma } from '@statpulse/database';
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
export declare function listUserMonitorsWithLatestResult(userId: string): Prisma.PrismaPromise<({
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
    userId: string;
    type: import("@statpulse/database").MonitorType;
    name: string | null;
    createdAt: Date;
    status: import("@statpulse/database").MonitorStatus;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    isActive: boolean;
    lastCheckedAt: Date | null;
})[]>;
export declare function createMonitor(data: CreateMonitorData): Prisma.Prisma__MonitorClient<{
    method: import("@statpulse/database").HttpMethod;
    url: string;
    id: string;
    userId: string;
    type: import("@statpulse/database").MonitorType;
    name: string | null;
    createdAt: Date;
    status: import("@statpulse/database").MonitorStatus;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    isActive: boolean;
    lastCheckedAt: Date | null;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: Prisma.GlobalOmitConfig | undefined;
}>;
export declare function updateMonitor(id: string, data: UpdateMonitorData): Prisma.Prisma__MonitorClient<{
    method: import("@statpulse/database").HttpMethod;
    url: string;
    id: string;
    userId: string;
    type: import("@statpulse/database").MonitorType;
    name: string | null;
    createdAt: Date;
    status: import("@statpulse/database").MonitorStatus;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    isActive: boolean;
    lastCheckedAt: Date | null;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: Prisma.GlobalOmitConfig | undefined;
}>;
export declare function findUserMonitorById(userId: string, monitorId: string): Prisma.Prisma__MonitorClient<{
    method: import("@statpulse/database").HttpMethod;
    url: string;
    id: string;
    userId: string;
    type: import("@statpulse/database").MonitorType;
    name: string | null;
    createdAt: Date;
    status: import("@statpulse/database").MonitorStatus;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    isActive: boolean;
    lastCheckedAt: Date | null;
} | null, null, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: Prisma.GlobalOmitConfig | undefined;
}>;
export declare function deleteMonitor(id: string): Prisma.Prisma__MonitorClient<{
    method: import("@statpulse/database").HttpMethod;
    url: string;
    id: string;
    userId: string;
    type: import("@statpulse/database").MonitorType;
    name: string | null;
    createdAt: Date;
    status: import("@statpulse/database").MonitorStatus;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    isActive: boolean;
    lastCheckedAt: Date | null;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: Prisma.GlobalOmitConfig | undefined;
}>;
export declare function listMonitorResults(userId: string, monitorId: string, limit: number): Prisma.PrismaPromise<{
    statusCode: number | null;
    id: string;
    createdAt: Date;
    monitorId: string;
    responseTimeMs: number;
    isUp: boolean;
    errorMessage: string | null;
}[]>;
export declare function listMonitorIncidents(userId: string, monitorId: string, limit: number): Prisma.PrismaPromise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    monitorId: string;
    startedAt: Date;
    resolvedAt: Date | null;
    reason: string | null;
}[]>;
export type MonitorMetricsBucket = {
    bucketStart: Date;
    checkCount: number;
    avgResponseTimeMs: number | null;
    minResponseTimeMs: number | null;
    maxResponseTimeMs: number | null;
    availability: number | null;
};
export declare function listMonitorMetricsBuckets(input: {
    userId: string;
    monitorId: string;
    from: Date;
    to: Date;
    bucketSeconds: number;
}): Prisma.PrismaPromise<MonitorMetricsBucket[]>;
export declare function buildContinuousMetricsRefreshQuery(from: Date, to: Date): import("@prisma/client-runtime-utils").Sql;
export declare function listActiveMonitorSchedulerData(): Prisma.PrismaPromise<{
    method: import("@statpulse/database").HttpMethod;
    url: string;
    id: string;
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    isActive: boolean;
}[]>;
