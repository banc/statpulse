export type CreateMonitorData = {
    userId: string;
    url: string;
    intervalSeconds: number;
};
export type UpdateMonitorData = {
    url?: string;
    intervalSeconds?: number;
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
    userId: string;
    url: string;
    intervalSeconds: number;
    isActive: boolean;
})[]>;
export declare function createMonitor(data: CreateMonitorData): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__MonitorClient<{
    id: string;
    createdAt: Date;
    userId: string;
    url: string;
    intervalSeconds: number;
    isActive: boolean;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function updateMonitor(id: string, data: UpdateMonitorData): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__MonitorClient<{
    id: string;
    createdAt: Date;
    userId: string;
    url: string;
    intervalSeconds: number;
    isActive: boolean;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function deleteMonitor(id: string): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__MonitorClient<{
    id: string;
    createdAt: Date;
    userId: string;
    url: string;
    intervalSeconds: number;
    isActive: boolean;
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
export declare function listActiveMonitorSchedulerData(): import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").PrismaPromise<{
    id: string;
    url: string;
    intervalSeconds: number;
    isActive: boolean;
}[]>;
