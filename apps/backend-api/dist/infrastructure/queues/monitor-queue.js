"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorQueue = void 0;
const bullmq_1 = require("bullmq");
const env_1 = require("../../config/env");
exports.monitorQueue = new bullmq_1.Queue('monitor-tasks', {
    connection: { url: env_1.env.redisUrl },
});
//# sourceMappingURL=monitor-queue.js.map