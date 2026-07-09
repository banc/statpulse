import { ensureDevUser } from '../dev-users/dev-user.service';
import {
  createMonitor,
  deleteMonitor,
  listActiveMonitorSchedulerData,
  listMonitorIncidents,
  listMonitorResults,
  listUserMonitorsWithLatestResult,
  updateMonitor,
  UpdateMonitorData,
} from './monitor.repository';
import {
  normalizeExpectedStatus,
  normalizeHttpMethod,
  normalizeIntervalSeconds,
  normalizeName,
  normalizeResultsLimit,
  normalizeTimeoutMs,
  normalizeUrl,
} from './monitor.validation';
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

export async function createHttpMonitor(input: {
  name: unknown;
  url: unknown;
  method: unknown;
  expectedStatus: unknown;
  intervalSeconds: unknown;
  timeoutMs: unknown;
}) {
  const user = await ensureDevUser();
  const monitor = await createMonitor({
    userId: user.id,
    name: normalizeName(input.name),
    url: normalizeUrl(input.url),
    method: normalizeHttpMethod(input.method),
    expectedStatus: normalizeExpectedStatus(input.expectedStatus),
    intervalSeconds: normalizeIntervalSeconds(input.intervalSeconds),
    timeoutMs: normalizeTimeoutMs(input.timeoutMs),
  });

  await scheduleMonitor(monitor);
  await enqueueImmediateMonitorCheck(monitor);

  return monitor;
}

export async function getMonitorResults(input: { monitorId: string; limit: unknown }) {
  return listMonitorResults(input.monitorId, normalizeResultsLimit(input.limit));
}

export async function getMonitorIncidents(input: { monitorId: string; limit: unknown }) {
  return listMonitorIncidents(input.monitorId, normalizeResultsLimit(input.limit));
}

export async function updateHttpMonitor(
  monitorId: string,
  input: {
    name?: unknown;
    url?: unknown;
    method?: unknown;
    expectedStatus?: unknown;
    intervalSeconds?: unknown;
    timeoutMs?: unknown;
    isActive?: unknown;
  },
) {
  const data: UpdateMonitorData = {};

  if (input.name !== undefined) {
    data.name = normalizeName(input.name) ?? null;
  }

  if (input.url !== undefined) {
    data.url = normalizeUrl(input.url);
  }

  if (input.method !== undefined) {
    data.method = normalizeHttpMethod(input.method);
  }

  if (input.expectedStatus !== undefined) {
    data.expectedStatus = normalizeExpectedStatus(input.expectedStatus);
  }

  if (input.intervalSeconds !== undefined) {
    data.intervalSeconds = normalizeIntervalSeconds(input.intervalSeconds);
  }

  if (input.timeoutMs !== undefined) {
    data.timeoutMs = normalizeTimeoutMs(input.timeoutMs);
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
