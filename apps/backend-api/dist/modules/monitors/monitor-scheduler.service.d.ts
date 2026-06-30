export type SchedulableMonitor = {
    id: string;
    url: string;
    intervalSeconds: number;
    isActive: boolean;
};
export declare function schedulerIdForMonitor(monitorId: string): string;
export declare function enqueueImmediateMonitorCheck(monitor: {
    id: string;
    url: string;
}): Promise<void>;
export declare function scheduleMonitor(monitor: SchedulableMonitor): Promise<void>;
export declare function removeMonitorScheduler(monitorId: string): Promise<void>;
