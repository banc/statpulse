import 'dotenv/config';

import { Worker, Job } from 'bullmq';
import { MonitorStatus, prisma } from '@statpulse/database';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 10000);

type MonitorJobData = {
  monitorId: string;
  url: string;
  method?: 'GET' | 'HEAD';
  expectedStatus?: number;
  timeoutMs?: number;
};

function isMonitorJobData(data: unknown): data is MonitorJobData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const payload = data as Record<string, unknown>;

  return (
    typeof payload.monitorId === 'string' &&
    typeof payload.url === 'string' &&
    (payload.method === undefined || payload.method === 'GET' || payload.method === 'HEAD') &&
    (payload.expectedStatus === undefined || typeof payload.expectedStatus === 'number') &&
    (payload.timeoutMs === undefined || typeof payload.timeoutMs === 'number')
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.name === 'AbortError' ? 'Timeout' : error.message;
  }

  return 'Unknown error';
}

type CheckResult = {
  monitorId: string;
  statusCode?: number;
  responseTimeMs: number;
  isUp: boolean;
  errorMessage?: string;
};

async function saveCheckResult(result: CheckResult) {
  const checkedAt = new Date();
  const nextStatus = result.isUp ? MonitorStatus.UP : MonitorStatus.DOWN;

  await prisma.$transaction(async (tx) => {
    const monitor = await tx.monitor.findUnique({
      where: { id: result.monitorId },
      select: { status: true },
    });

    if (!monitor) {
      console.warn(`[Monitor ${result.monitorId}] Skipping result: monitor was deleted`);
      return;
    }

    await tx.monitorResult.create({
      data: {
        monitorId: result.monitorId,
        responseTimeMs: result.responseTimeMs,
        statusCode: result.statusCode,
        isUp: result.isUp,
        errorMessage: result.errorMessage,
        createdAt: checkedAt,
      },
    });

    await tx.monitor.update({
      where: { id: result.monitorId },
      data: {
        status: nextStatus,
        lastCheckedAt: checkedAt,
      },
    });

    if (nextStatus === MonitorStatus.DOWN && monitor.status !== MonitorStatus.DOWN) {
      const openIncident = await tx.incident.findFirst({
        where: {
          monitorId: result.monitorId,
          resolvedAt: null,
        },
        select: { id: true },
      });

      if (!openIncident) {
        await tx.incident.create({
          data: {
            monitorId: result.monitorId,
            startedAt: checkedAt,
            reason: result.errorMessage || `HTTP status ${result.statusCode ?? 'unknown'}`,
          },
        });
      }
    }

    if (nextStatus === MonitorStatus.UP && monitor.status === MonitorStatus.DOWN) {
      await tx.incident.updateMany({
        where: {
          monitorId: result.monitorId,
          resolvedAt: null,
        },
        data: {
          resolvedAt: checkedAt,
        },
      });
    }
  });
}

console.log('🚀 StatPulse background worker started...');

// Initialize BullMQ Worker
const worker = new Worker(
  'monitor-tasks',
  async (job: Job) => {
    if (!isMonitorJobData(job.data)) {
      throw new Error('Invalid monitor job payload');
    }

    const { monitorId, url, method = 'GET', expectedStatus = 200, timeoutMs = REQUEST_TIMEOUT_MS } = job.data;

    console.log(`[Job ${job.id}] Checking site: ${url}`);

    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method,
          signal: controller.signal,
          headers: { 'User-Agent': 'StatPulseMonitor/1.0' },
        });

        const responseTimeMs = Math.round(performance.now() - startTime);
        const isUp = response.status === expectedStatus;
        const errorMessage = isUp ? undefined : `Expected status ${expectedStatus}, got ${response.status}`;

        await saveCheckResult({
          monitorId,
          responseTimeMs,
          statusCode: response.status,
          isUp,
          errorMessage,
        });

        console.log(`[Job ${job.id}] ${url} -> Status: ${response.status}, Time: ${responseTimeMs}ms`);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error: unknown) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      const errorMessage = getErrorMessage(error);

      await saveCheckResult({
        monitorId,
        responseTimeMs,
        isUp: false,
        errorMessage,
      });

      console.error(`[Job ${job.id}] ❌ ${url} DOWN! Error: ${errorMessage}`);
    }
  },
  {
    // Redis connection settings
    connection: {
      url: REDIS_URL,
    },
    concurrency: 5, // How many sites the worker can ping SIMULTANEOUSLY
  },
);

// BullMQ, if Redis is down
worker.on('failed', (job, err) => {
  console.error(`Error ${job?.id}:`, err);
});
