"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bullmq_1 = require("bullmq");
const database_1 = require("@statpulse/database");
const url_safety_1 = require("@statpulse/url-safety");
const alert_delivery_1 = require("./alert-delivery");
const monitor_state_transition_1 = require("./monitor-state-transition");
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 10000);
function isMonitorJobData(data) {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    const payload = data;
    return (typeof payload.monitorId === 'string' &&
        typeof payload.url === 'string' &&
        (payload.method === undefined || payload.method === 'GET' || payload.method === 'HEAD') &&
        (payload.expectedStatus === undefined || typeof payload.expectedStatus === 'number') &&
        (payload.timeoutMs === undefined || typeof payload.timeoutMs === 'number'));
}
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.name === 'AbortError' ? 'Timeout' : error.message;
    }
    return 'Unknown error';
}
async function saveCheckResult(result) {
    const checkedAt = new Date();
    const alertEvents = [];
    await database_1.prisma.$transaction(async (tx) => {
        const monitor = await tx.monitor.findUnique({
            where: { id: result.monitorId },
            select: {
                status: true,
                userId: true,
                name: true,
                url: true,
            },
        });
        if (!monitor) {
            console.warn(`[Monitor ${result.monitorId}] Skipping result: monitor was deleted`);
            return;
        }
        const transition = (0, monitor_state_transition_1.getMonitorStateTransition)(monitor.status, result.isUp);
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
                status: transition.nextStatus,
                lastCheckedAt: checkedAt,
            },
        });
        if (transition.shouldOpenIncident) {
            const openIncident = await tx.incident.findFirst({
                where: {
                    monitorId: result.monitorId,
                    resolvedAt: null,
                },
                select: { id: true },
            });
            if (!openIncident) {
                const incident = await tx.incident.create({
                    data: {
                        monitorId: result.monitorId,
                        startedAt: checkedAt,
                        reason: result.errorMessage || `HTTP status ${result.statusCode ?? 'unknown'}`,
                    },
                });
                alertEvents.push({
                    type: 'INCIDENT_OPENED',
                    userId: monitor.userId,
                    monitorId: result.monitorId,
                    monitorName: monitor.name,
                    monitorUrl: monitor.url,
                    incidentId: incident.id,
                    reason: incident.reason,
                    occurredAt: checkedAt,
                });
            }
        }
        if (transition.shouldCloseIncidents) {
            const openIncident = await tx.incident.findFirst({
                where: {
                    monitorId: result.monitorId,
                    resolvedAt: null,
                },
                orderBy: { startedAt: 'desc' },
            });
            await tx.incident.updateMany({
                where: {
                    monitorId: result.monitorId,
                    resolvedAt: null,
                },
                data: {
                    resolvedAt: checkedAt,
                },
            });
            if (openIncident) {
                alertEvents.push({
                    type: 'INCIDENT_RESOLVED',
                    userId: monitor.userId,
                    monitorId: result.monitorId,
                    monitorName: monitor.name,
                    monitorUrl: monitor.url,
                    incidentId: openIncident.id,
                    reason: openIncident.reason,
                    occurredAt: checkedAt,
                });
            }
        }
    });
    await Promise.all(alertEvents.map(alert_delivery_1.deliverAlertEvent));
}
console.log('🚀 StatPulse background worker started...');
// Initialize BullMQ Worker
const worker = new bullmq_1.Worker('monitor-tasks', async (job) => {
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
            const response = await (0, url_safety_1.safeFetch)(url, {
                method,
                timeoutMs,
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
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    catch (error) {
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