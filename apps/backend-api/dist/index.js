"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const env_1 = require("./config/env");
const monitor_service_1 = require("./modules/monitors/monitor.service");
const app = (0, app_1.createApp)();
app.listen(env_1.env.port, async () => {
    console.log(`🚀 Backend StatPulse started on port ${env_1.env.port}`);
    await (0, monitor_service_1.syncActiveMonitorSchedulers)();
});
//# sourceMappingURL=index.js.map