"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAlertChannelsController = listAlertChannelsController;
exports.createAlertChannelController = createAlertChannelController;
exports.updateAlertChannelController = updateAlertChannelController;
exports.deleteAlertChannelController = deleteAlertChannelController;
exports.listAlertDeliveryLogsController = listAlertDeliveryLogsController;
const auth_middleware_1 = require("../auth/auth.middleware");
const alert_channel_service_1 = require("./alert-channel.service");
async function listAlertChannelsController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    const channels = await (0, alert_channel_service_1.listAlertChannels)(auth.userId);
    res.json({ data: channels });
}
async function createAlertChannelController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    const channel = await (0, alert_channel_service_1.createUserAlertChannel)({
        userId: auth.userId,
        type: req.body.type,
        name: req.body.name,
        config: req.body.config,
        cooldownSeconds: req.body.cooldownSeconds,
    });
    res.status(201).json({ data: channel });
}
async function updateAlertChannelController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    const channel = await (0, alert_channel_service_1.updateUserAlertChannel)(auth.userId, req.params.id, {
        name: req.body.name,
        config: req.body.config,
        isEnabled: req.body.isEnabled,
        cooldownSeconds: req.body.cooldownSeconds,
    });
    res.json({ data: channel });
}
async function deleteAlertChannelController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    await (0, alert_channel_service_1.removeUserAlertChannel)(auth.userId, req.params.id);
    res.status(204).send();
}
async function listAlertDeliveryLogsController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    const logs = await (0, alert_channel_service_1.getAlertDeliveryLogs)({
        userId: auth.userId,
        limit: req.query.limit,
    });
    res.json({ data: logs });
}
//# sourceMappingURL=alert-channel.controller.js.map