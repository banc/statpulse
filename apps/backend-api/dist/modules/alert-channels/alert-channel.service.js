"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAlertChannels = listAlertChannels;
exports.createUserAlertChannel = createUserAlertChannel;
exports.updateUserAlertChannel = updateUserAlertChannel;
exports.removeUserAlertChannel = removeUserAlertChannel;
exports.getAlertDeliveryLogs = getAlertDeliveryLogs;
const database_1 = require("@statpulse/database");
const app_error_1 = require("../../shared/errors/app-error");
const alert_channel_repository_1 = require("./alert-channel.repository");
const alert_channel_validation_1 = require("./alert-channel.validation");
async function listAlertChannels(userId) {
    const channels = await (0, alert_channel_repository_1.listUserAlertChannels)(userId);
    return channels.map(toAlertChannelResponse);
}
async function createUserAlertChannel(input) {
    const type = (0, alert_channel_validation_1.normalizeAlertChannelType)(input.type);
    const channel = await (0, alert_channel_repository_1.createAlertChannel)({
        userId: input.userId,
        type,
        name: (0, alert_channel_validation_1.normalizeAlertChannelName)(input.name),
        config: (0, alert_channel_validation_1.normalizeAlertChannelConfig)(type, input.config),
        cooldownSeconds: (0, alert_channel_validation_1.normalizeCooldownSeconds)(input.cooldownSeconds),
    });
    return toAlertChannelResponse(channel);
}
async function updateUserAlertChannel(userId, id, input) {
    const existing = await assertUserAlertChannel(userId, id);
    const data = {};
    if (input.name !== undefined) {
        data.name = (0, alert_channel_validation_1.normalizeAlertChannelName)(input.name);
    }
    if (input.config !== undefined) {
        data.config = (0, alert_channel_validation_1.normalizeAlertChannelConfig)(existing.type, input.config);
    }
    if (input.isEnabled !== undefined) {
        data.isEnabled = (0, alert_channel_validation_1.normalizeOptionalEnabled)(input.isEnabled);
    }
    if (input.cooldownSeconds !== undefined) {
        data.cooldownSeconds = (0, alert_channel_validation_1.normalizeCooldownSeconds)(input.cooldownSeconds);
    }
    const channel = await (0, alert_channel_repository_1.updateAlertChannel)(id, data);
    return toAlertChannelResponse(channel);
}
async function removeUserAlertChannel(userId, id) {
    await assertUserAlertChannel(userId, id);
    await (0, alert_channel_repository_1.deleteAlertChannel)(id);
}
async function getAlertDeliveryLogs(input) {
    return (0, alert_channel_repository_1.listAlertDeliveryLogs)(input.userId, normalizeDeliveryLogLimit(input.limit));
}
async function assertUserAlertChannel(userId, id) {
    const channel = await (0, alert_channel_repository_1.findUserAlertChannelById)(userId, id);
    if (!channel) {
        throw new app_error_1.AppError('Alert channel not found', 404);
    }
    return channel;
}
function toAlertChannelResponse(channel) {
    const config = channel.config;
    return {
        id: channel.id,
        type: channel.type,
        name: channel.name,
        isEnabled: channel.isEnabled,
        cooldownSeconds: channel.cooldownSeconds,
        lastSentAt: channel.lastSentAt,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
        config: summarizeConfig(channel.type, config),
    };
}
function summarizeConfig(type, config) {
    if (type === database_1.AlertChannelType.TELEGRAM) {
        return {
            chatId: config.chatId,
            botTokenConfigured: typeof config.botToken === 'string' && config.botToken.length > 0,
        };
    }
    return {
        email: config.email,
    };
}
function normalizeDeliveryLogLimit(value) {
    const limit = Number(value || 50);
    if (!Number.isFinite(limit) || limit <= 0) {
        return 50;
    }
    return Math.min(limit, 200);
}
//# sourceMappingURL=alert-channel.service.js.map