"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const monitor_routes_1 = require("./modules/monitors/monitor.routes");
const error_handler_1 = require("./shared/http/error-handler");
function createApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: '32kb' }));
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.use('/auth', auth_routes_1.authRouter);
    app.use('/monitors', monitor_routes_1.monitorRouter);
    app.use(error_handler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map