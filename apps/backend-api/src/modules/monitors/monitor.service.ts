import { AppError } from '../../shared/errors/app-error';
import {
  createMonitor,
  deleteMonitor,
  findUserMonitorById,
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

export async function listMonitors(userId: string) {
  const monitors = await listUserMonitorsWithLatestResult(userId);

  return monitors.map((monitor) => ({
    ...monitor,
    latestResult: monitor.results[0] ?? null,
    results: undefined,
  }));
}

export async function createHttpMonitor(input: {
  userId: string;
  name: unknown;
  url: unknown;
  method: unknown;
  expectedStatus: unknown;
  intervalSeconds: unknown;
  timeoutMs: unknown;
}) {
  const monitor = await createMonitor({
    userId: input.userId,
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

async function assertUserMonitor(userId: string, monitorId: string) {
  const monitor = await findUserMonitorById(userId, monitorId);

  if (!monitor) {
    throw new AppError('Monitor not found', 404);
  }

  return monitor;
}

export async function getMonitorResults(input: { userId: string; monitorId: string; limit: unknown }) {
  await assertUserMonitor(input.userId, input.monitorId);

  return listMonitorResults(input.userId, input.monitorId, normalizeResultsLimit(input.limit));
}

export async function getMonitorIncidents(input: { userId: string; monitorId: string; limit: unknown }) {
  await assertUserMonitor(input.userId, input.monitorId);

  return listMonitorIncidents(input.userId, input.monitorId, normalizeResultsLimit(input.limit));
}

export async function updateHttpMonitor(
  userId: string,
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
  await assertUserMonitor(userId, monitorId);

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

export async function removeHttpMonitor(userId: string, monitorId: string) {
  await assertUserMonitor(userId, monitorId);

  await removeMonitorScheduler(monitorId);
  await deleteMonitor(monitorId);
}

export async function syncActiveMonitorSchedulers() {
  const activeMonitors = await listActiveMonitorSchedulerData();

  await Promise.all(activeMonitors.map(scheduleMonitor));

  console.log(`⏰ [Scheduler] Synced ${activeMonitors.length} active monitor(s)`);
}
