import { ensureDevUser } from '../dev-users/dev-user.service';
import {
  createMonitor,
  deleteMonitor,
  listActiveMonitorSchedulerData,
  listMonitorResults,
  listUserMonitorsWithLatestResult,
  updateMonitor,
  UpdateMonitorData,
} from './monitor.repository';
import { normalizeIntervalSeconds, normalizeResultsLimit, normalizeUrl } from './monitor.validation';
import { enqueueImmediateMonitorCheck, removeMonitorScheduler, scheduleMonitor } from './monitor-scheduler.service';

export async function listMonitors() {
  const user = await ensureDevUser();
  const monitors = await listUserMonitorsWithLatestResult(user.id);

  return monitors.map((monitor) => ({
    ...monitor,
    latestResult: monitor.results[0] ?? null,
    results: undefined,
  }));
}

export async function createHttpMonitor(input: { url: unknown; intervalSeconds: unknown }) {
  const user = await ensureDevUser();
  const monitor = await createMonitor({
    userId: user.id,
    url: normalizeUrl(input.url),
    intervalSeconds: normalizeIntervalSeconds(input.intervalSeconds),
  });

  await scheduleMonitor(monitor);
  await enqueueImmediateMonitorCheck(monitor);

  return monitor;
}

export async function getMonitorResults(input: { monitorId: string; limit: unknown }) {
  return listMonitorResults(input.monitorId, normalizeResultsLimit(input.limit));
}

export async function updateHttpMonitor(
  monitorId: string,
  input: {
    url?: unknown;
    intervalSeconds?: unknown;
    isActive?: unknown;
  },
) {
  const data: UpdateMonitorData = {};

  if (input.url !== undefined) {
    data.url = normalizeUrl(input.url);
  }

  if (input.intervalSeconds !== undefined) {
    data.intervalSeconds = normalizeIntervalSeconds(input.intervalSeconds);
  }

  if (input.isActive !== undefined) {
    data.isActive = Boolean(input.isActive);
  }

  const monitor = await updateMonitor(monitorId, data);

  await scheduleMonitor(monitor);

  if (monitor.isActive) {
    await enqueueImmediateMonitorCheck(monitor);
  }

  return monitor;
}

export async function removeHttpMonitor(monitorId: string) {
  await removeMonitorScheduler(monitorId);
  await deleteMonitor(monitorId);
}

export async function syncActiveMonitorSchedulers() {
  const activeMonitors = await listActiveMonitorSchedulerData();

  await Promise.all(activeMonitors.map(scheduleMonitor));

  console.log(`⏰ [Scheduler] Synced ${activeMonitors.length} active monitor(s)`);
}
