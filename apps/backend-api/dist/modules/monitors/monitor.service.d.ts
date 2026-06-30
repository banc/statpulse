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
    userId: string;
    url: string;
    intervalSeconds: number;
    isActive: boolean;
}[]>;
export declare function createHttpMonitor(input: {
    url: unknown;
    intervalSeconds: unknown;
}): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    url: string;
    intervalSeconds: number;
    isActive: boolean;
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
export declare function updateHttpMonitor(monitorId: string, input: {
    url?: unknown;
    intervalSeconds?: unknown;
    isActive?: unknown;
}): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    url: string;
    intervalSeconds: number;
    isActive: boolean;
}>;
export declare function removeHttpMonitor(monitorId: string): Promise<void>;
export declare function syncActiveMonitorSchedulers(): Promise<void>;
