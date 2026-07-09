export type SchedulableMonitor = {
    id: string;
    url: string;
    method: 'GET' | 'HEAD';
    expectedStatus: number;
    intervalSeconds: number;
    timeoutMs: number;
    isActive: boolean;
};
export declare function schedulerIdForMonitor(monitorId: string): string;
export declare function enqueueImmediateMonitorCheck(monitor: SchedulableMonitor): Promise<void>;
export declare function scheduleMonitor(monitor: SchedulableMonitor): Promise<void>;
export declare function removeMonitorScheduler(monitorId: string): Promise<void>;
