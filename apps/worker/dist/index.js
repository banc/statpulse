"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bullmq_1 = require("bullmq");
const database_1 = require("@statpulse/database");
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 10000);
function isMonitorJobData(data) {
    return (typeof data === 'object' &&
        data !== null &&
        'monitorId' in data &&
        'url' in data &&
        typeof data.monitorId === 'string' &&
        typeof data.url === 'string');
}
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.name === 'AbortError' ? 'Timeout' : error.message;
    }
    return 'Unknown error';
}
console.log('🚀 StatPulse background worker started...');
// Initialize BullMQ Worker
const worker = new bullmq_1.Worker('monitor-tasks', async (job) => {
    if (!isMonitorJobData(job.data)) {
        throw new Error('Invalid monitor job payload');
    }
    const { monitorId, url } = job.data;
    console.log(`[Job ${job.id}] Checking site: ${url}`);
    const startTime = performance.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'User-Agent': 'StatPulseMonitor/1.0' },
        });
        clearTimeout(timeoutId);
        const responseTimeMs = Math.round(performance.now() - startTime);
        const isUp = response.status >= 200 && response.status < 400;
        // Save the result to Postgres
        await database_1.prisma.monitorResult.create({
            data: {
                monitorId,
                responseTimeMs,
                statusCode: response.status,
                isUp,
            },
        });
        console.log(`[Job ${job.id}] ${url} -> Status: ${response.status}, Time: ${responseTimeMs}ms`);
    }
    catch (error) {
        const responseTimeMs = Math.round(performance.now() - startTime);
        const errorMessage = getErrorMessage(error);
        // Site is down or unavailable (DNS error, timeout, etc.)
        await database_1.prisma.monitorResult.create({
            data: {
                monitorId,
                responseTimeMs,
                isUp: false,
                errorMessage,
            },
        });
        console.error(`[Job ${job.id}] ❌ ${url} DOWN! Error: ${errorMessage}`);
    }
}, {
    // Redis connection settings
    connection: {
        url: REDIS_URL,
    },
    concurrency: 5, // How many sites the worker can ping SIMULTANEOUSLY
});
// BullMQ, if Redis is down
worker.on('failed', (job, err) => {
    console.error(`Error ${job?.id}:`, err);
});
//# sourceMappingURL=index.js.map