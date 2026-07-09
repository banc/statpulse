"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertChannelRouter = void 0;
const express_1 = require("express");
const async_handler_1 = require("../../shared/http/async-handler");
const auth_middleware_1 = require("../auth/auth.middleware");
const alert_channel_controller_1 = require("./alert-channel.controller");
exports.alertChannelRouter = (0, express_1.Router)();
exports.alertChannelRouter.use(auth_middleware_1.requireAuth);
exports.alertChannelRouter.get('/', (0, async_handler_1.asyncHandler)(alert_channel_controller_1.listAlertChannelsController));
exports.alertChannelRouter.post('/', (0, async_handler_1.asyncHandler)(alert_channel_controller_1.createAlertChannelController));
exports.alertChannelRouter.get('/deliveries', (0, async_handler_1.asyncHandler)(alert_channel_controller_1.listAlertDeliveryLogsController));
exports.alertChannelRouter.patch('/:id', (0, async_handler_1.asyncHandler)(alert_channel_controller_1.updateAlertChannelController));
exports.alertChannelRouter.delete('/:id', (0, async_handler_1.asyncHandler)(alert_channel_controller_1.deleteAlertChannelController));
//# sourceMappingURL=alert-channel.routes.js.map