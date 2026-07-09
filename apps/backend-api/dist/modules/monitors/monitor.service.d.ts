export declare function listMonitors(): Promise<{
    latestResult: {
        id: string;
        createdAt: Date;
        monitorId: string;
        responseTimeMs: number;
        statusCode: number | null;
        isUp: boolean;
        errorMessage: string | null;
    };
    results: undefined;
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
}[]>;
export declare function createHttpMonitor(input: {
    name: unknown;
    url: unknown;
    method: unknown;
    expectedStatus: unknown;
    intervalSeconds: unknown;
    timeoutMs: unknown;
}): Promise<{
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
}>;
export declare function getMonitorResults(input: {
    monitorId: string;
    limit: unknown;
}): Promise<{
    id: string;
    createdAt: Date;
    monitorId: string;
    responseTimeMs: number;
    statusCode: number | null;
    isUp: boolean;
    errorMessage: string | null;
}[]>;
export declare function getMonitorIncidents(input: {
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
export declare function updateHttpMonitor(monitorId: string, input: {
    name?: unknown;
    url?: unknown;
    method?: unknown;
    expectedStatus?: unknown;
    intervalSeconds?: unknown;
    timeoutMs?: unknown;
    isActive?: unknown;
}): Promise<{
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
}>;
export declare function removeHttpMonitor(monitorId: string): Promise<void>;
export declare function syncActiveMonitorSchedulers(): Promise<void>;
