import { Worker, Job } from 'bullmq';
import { prisma } from '@statpulse/database';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

console.log('🚀 StatPulse background worker started...');

// Initialize BullMQ Worker
const worker = new Worker(
  'monitor-tasks',
  async (job: Job) => {
    const { monitorId, url } = job.data;

    console.log(`[Job ${job.id}] Checking site: ${url}`);

    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': 'StatPulseMonitor/1.0' },
      });

      clearTimeout(timeoutId);

      const responseTimeMs = Math.round(performance.now() - startTime);
      const isUp = response.status >= 200 && response.status < 400;

      // Save the result to Postgres
      await prisma.monitorResult.create({
        data: {
          monitorId,
          responseTimeMs,
          statusCode: response.status,
          isUp,
        },
      });

      console.log(
        `[Job ${job.id}] ${url} -> Status: ${response.status}, Time: ${responseTimeMs}ms`,
      );
    } catch (error: any) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      const errorMessage =
        error.name === 'AbortError' ? 'Timeout' : error.message;

      // Site is down or unavailable (DNS error, timeout, etc.)
      await prisma.monitorResult.create({
        data: {
          monitorId,
          responseTimeMs,
          isUp: false,
          errorMessage,
        },
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
