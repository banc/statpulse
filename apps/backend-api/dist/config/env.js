"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.env = {
    port: Number(process.env.PORT || process.env.API_PORT || 3001),
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    devUserEmail: process.env.DEV_USER_EMAIL || 'dev@statpulse.local',
};
//# sourceMappingURL=env.js.map