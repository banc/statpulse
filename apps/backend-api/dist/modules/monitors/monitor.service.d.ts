export declare function listMonitors(userId: string): Promise<{
    latestResult: {
        statusCode: number | null;
        id: string;
        createdAt: Date;
        monitorId: string;
        responseTimeMs: number;
        isUp: boolean;
        errorMessage: string | null;
    };
    results: undefined;
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
}[]>;
export declare function createHttpMonitor(input: {
    userId: string;
    name: unknown;
    url: unknown;
    method: unknown;
    expectedStatus: unknown;
    intervalSeconds: unknown;
    timeoutMs: unknown;
}): Promise<{
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
}>;
export declare function getMonitorResults(input: {
    userId: string;
    monitorId: string;
    limit: unknown;
}): Promise<{
    statusCode: number | null;
    id: string;
    createdAt: Date;
    monitorId: string;
    responseTimeMs: number;
    isUp: boolean;
    errorMessage: string | null;
}[]>;
export declare function getMonitorIncidents(input: {
    userId: string;
    monitorId: string;
    limit: unknown;
}): Promise<{
    id: string;
    createdAt: Date;
    monitorId: string;
    startedAt: Date;
    resolvedAt: Date | null;
    reason: string | null;
    updatedAt: Date;
}[]>;
export declare function updateHttpMonitor(userId: string, monitorId: string, input: {
    name?: unknown;
    url?: unknown;
    method?: unknown;
    expectedStatus?: unknown;
    intervalSeconds?: unknown;
    timeoutMs?: unknown;
    isActive?: unknown;
}): Promise<{
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
}>;
export declare function removeHttpMonitor(userId: string, monitorId: string): Promise<void>;
export declare function syncActiveMonitorSchedulers(): Promise<void>;
