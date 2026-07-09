import { monitorQueue } from '../../infrastructure/queues/monitor-queue';

export type SchedulableMonitor = {
  id: string;
  url: string;
  method: 'GET' | 'HEAD';
  expectedStatus: number;
  intervalSeconds: number;
  timeoutMs: number;
  isActive: boolean;
};

export function schedulerIdForMonitor(monitorId: string) {
  return `monitor-${monitorId}`;
}

export async function enqueueImmediateMonitorCheck(monitor: SchedulableMonitor) {
  await monitorQueue.add(
    'ping-job',
    {
      monitorId: monitor.id,
      url: monitor.url,
      method: monitor.method,
      expectedStatus: monitor.expectedStatus,
      timeoutMs: monitor.timeoutMs,
    },
    {
      jobId: `manual-${monitor.id}-${Date.now()}`,
      removeOnComplete: 100,
      removeOnFail: 100,
    },
  );
}

export async function scheduleMonitor(monitor: SchedulableMonitor) {
  const schedulerId = schedulerIdForMonitor(monitor.id);

  if (!monitor.isActive) {
    await removeMonitorScheduler(monitor.id);
    return;
  }

  await monitorQueue.upsertJobScheduler(
    schedulerId,
    { every: monitor.intervalSeconds * 1000 },
    {
      name: 'ping-job',
      data: {
        monitorId: monitor.id,
        url: monitor.url,
        method: monitor.method,
        expectedStatus: monitor.expectedStatus,
        timeoutMs: monitor.timeoutMs,
      },
      opts: {
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    },
  );
}

export async function removeMonitorScheduler(monitorId: string) {
  await monitorQueue.removeJobScheduler(schedulerIdForMonitor(monitorId));
}
