"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const bullmq_1 = require("bullmq");
const database_1 = require("@statpulse/database");
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DEV_USER_EMAIL = process.env.DEV_USER_EMAIL || 'dev@statpulse.local';
const MIN_INTERVAL_SECONDS = 30;
const app = (0, express_1.default)();
app.use(express_1.default.json());
const monitorQueue = new bullmq_1.Queue('monitor-tasks', {
    connection: { url: REDIS_URL },
});
function asyncHandler(handler) {
    return (req, res, next) => {
        void handler(req, res, next).catch(next);
    };
}
function normalizeUrl(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('URL is required');
    }
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported for MVP');
    }
    return url.toString();
}
function normalizeIntervalSeconds(value) {
    if (value === undefined) {
        return 60;
    }
    const intervalSeconds = Number(value);
    if (!Number.isInteger(intervalSeconds) || intervalSeconds < MIN_INTERVAL_SECONDS) {
        throw new Error(`intervalSeconds must be at least ${MIN_INTERVAL_SECONDS}`);
    }
    return intervalSeconds;
}
function schedulerIdForMonitor(monitorId) {
    return `monitor-${monitorId}`;
}
async function ensureDevUser() {
    return database_1.prisma.user.upsert({
        where: { email: DEV_USER_EMAIL },
        update: {},
        create: {
            email: DEV_USER_EMAIL,
            passwordHash: 'dev-only-password-placeholder',
        },
    });
}
async function enqueueImmediateCheck(monitor) {
    await monitorQueue.add('ping-job', {
        monitorId: monitor.id,
        url: monitor.url,
    }, {
        jobId: `manual-${monitor.id}-${Date.now()}`,
        removeOnComplete: 100,
        removeOnFail: 100,
    });
}
async function scheduleMonitor(monitor) {
    const schedulerId = schedulerIdForMonitor(monitor.id);
    if (!monitor.isActive) {
        await monitorQueue.removeJobScheduler(schedulerId);
        return;
    }
    await monitorQueue.upsertJobScheduler(schedulerId, { every: monitor.intervalSeconds * 1000 }, {
        name: 'ping-job',
        data: {
            monitorId: monitor.id,
            url: monitor.url,
        },
        opts: {
            removeOnComplete: 100,
            removeOnFail: 100,
        },
    });
}
async function syncActiveMonitorSchedulers() {
    const activeMonitors = await database_1.prisma.monitor.findMany({
        where: { isActive: true },
        select: {
            id: true,
            url: true,
            intervalSeconds: true,
            isActive: true,
        },
    });
    await Promise.all(activeMonitors.map(scheduleMonitor));
    console.log(`⏰ [Scheduler] Synced ${activeMonitors.length} active monitor(s)`);
}
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/monitors', asyncHandler(async (_req, res) => {
    const user = await ensureDevUser();
    const monitors = await database_1.prisma.monitor.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            results: {
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
    });
    res.json({
        data: monitors.map((monitor) => ({
            ...monitor,
            latestResult: monitor.results[0] ?? null,
            results: undefined,
        })),
    });
}));
app.post('/monitors', asyncHandler(async (req, res) => {
    const user = await ensureDevUser();
    const url = normalizeUrl(req.body.url);
    const intervalSeconds = normalizeIntervalSeconds(req.body.intervalSeconds);
    const monitor = await database_1.prisma.monitor.create({
        data: {
            userId: user.id,
            url,
            intervalSeconds,
            isActive: true,
        },
    });
    await scheduleMonitor(monitor);
    await enqueueImmediateCheck(monitor);
    res.status(201).json({ data: monitor });
}));
app.get('/monitors/:id/results', asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const results = await database_1.prisma.monitorResult.findMany({
        where: { monitorId: req.params.id },
        orderBy: { createdAt: 'desc' },
        take: Number.isFinite(limit) && limit > 0 ? limit : 50,
    });
    res.json({ data: results });
}));
app.patch('/monitors/:id', asyncHandler(async (req, res) => {
    const data = {};
    if (req.body.url !== undefined) {
        data.url = normalizeUrl(req.body.url);
    }
    if (req.body.intervalSeconds !== undefined) {
        data.intervalSeconds = normalizeIntervalSeconds(req.body.intervalSeconds);
    }
    if (req.body.isActive !== undefined) {
        data.isActive = Boolean(req.body.isActive);
    }
    const monitor = await database_1.prisma.monitor.update({
        where: { id: req.params.id },
        data,
    });
    await scheduleMonitor(monitor);
    if (monitor.isActive) {
        await enqueueImmediateCheck(monitor);
    }
    res.json({ data: monitor });
}));
app.delete('/monitors/:id', asyncHandler(async (req, res) => {
    await monitorQueue.removeJobScheduler(schedulerIdForMonitor(req.params.id));
    await database_1.prisma.monitor.delete({
        where: { id: req.params.id },
    });
    res.status(204).send();
}));
app.use((error, _req, res, _next) => {
    void _next;
    console.error('🚨 [API]', error);
    res.status(400).json({
        error: error.message || 'Unexpected API error',
    });
});
app.listen(PORT, async () => {
    console.log(`🚀 Backend StatPulse started on port ${PORT}`);
    await syncActiveMonitorSchedulers();
});
//# sourceMappingURL=index.js.map