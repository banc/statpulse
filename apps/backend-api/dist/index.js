"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bullmq_1 = require("bullmq");
const database_1 = require("@statpulse/database");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
const PORT = process.env.PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const app = (0, express_1.default)();
app.use(express_1.default.json());
// 1. Initialize BullMQ queue for sending to worker
const monitorQueue = new bullmq_1.Queue('monitor-tasks', {
    connection: { url: REDIS_URL },
});
// 2. Scheduler function: finds all sites in the database and pushes them to Redis
async function scheduleMonitoringJobs() {
    try {
        const monitors = await database_1.prisma.monitor.findMany({
            select: { id: true, url: true },
        });
        console.log(`⏰ [Scheduler] Found ${monitors.length} sites to check. Sending to queue...`);
        for (const monitor of monitors) {
            await monitorQueue.add('ping-job', {
                monitorId: monitor.id,
                url: monitor.url,
            }, {
                // Protection against duplicates at the same time
                jobId: `cron-${monitor.id}-${Math.floor(Date.now() / 60000)}`,
            });
        }
    }
    catch (error) {
        console.error('🚨 [Scheduler] Error during job scheduling:', error);
    }
}
// 3. Start system tick (once a minute) via BullMQ repeater
async function initScheduler() {
    const schedulerQueue = new bullmq_1.Queue('scheduler-sync', {
        connection: { url: REDIS_URL },
    });
    // Clear old repeaters to avoid duplicates during dev server restarts
    const repeatableJobs = await schedulerQueue.getJobSchedulers();
    for (const job of repeatableJobs) {
        await schedulerQueue.removeJobScheduler(job.key);
    }
    // Create one recurring task per minute using the modern Job Scheduler API
    await schedulerQueue.upsertJobScheduler('sync-scheduler', { pattern: '*/1 * * * *' }, // Every minute
    { name: 'sync-trigger', data: {} });
    // Local start the first time immediately on startup, so as not to wait a minute
    await scheduleMonitoringJobs();
}
// 4. Simplest basic endpoints for checking
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Backend StatPulse started on port ${PORT}`);
    // Start scheduler
    await initScheduler();
});
//# sourceMappingURL=index.js.map