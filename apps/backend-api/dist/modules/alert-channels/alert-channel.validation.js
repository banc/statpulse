"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAlertChannelType = normalizeAlertChannelType;
exports.normalizeAlertChannelName = normalizeAlertChannelName;
exports.normalizeCooldownSeconds = normalizeCooldownSeconds;
exports.normalizeAlertChannelConfig = normalizeAlertChannelConfig;
exports.normalizeOptionalEnabled = normalizeOptionalEnabled;
const database_1 = require("@statpulse/database");
const app_error_1 = require("../../shared/errors/app-error");
const MIN_COOLDOWN_SECONDS = 60;
const MAX_COOLDOWN_SECONDS = 24 * 60 * 60;
const DEFAULT_COOLDOWN_SECONDS = 300;
function normalizeAlertChannelType(value) {
    if (value !== database_1.AlertChannelType.TELEGRAM && value !== database_1.AlertChannelType.EMAIL) {
        throw new app_error_1.AppError('type must be TELEGRAM or EMAIL');
    }
    return value;
}
function normalizeAlertChannelName(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new app_error_1.AppError('name is required');
    }
    const name = value.trim();
    if (name.length > 120) {
        throw new app_error_1.AppError('name must be 120 characters or less');
    }
    return name;
}
function normalizeCooldownSeconds(value) {
    if (value === undefined) {
        return DEFAULT_COOLDOWN_SECONDS;
    }
    const cooldownSeconds = Number(value);
    if (!Number.isInteger(cooldownSeconds) ||
        cooldownSeconds < MIN_COOLDOWN_SECONDS ||
        cooldownSeconds > MAX_COOLDOWN_SECONDS) {
        throw new app_error_1.AppError(`cooldownSeconds must be between ${MIN_COOLDOWN_SECONDS} and ${MAX_COOLDOWN_SECONDS}`);
    }
    return cooldownSeconds;
}
function normalizeAlertChannelConfig(type, value) {
    if (typeof value !== 'object' || value === null) {
        throw new app_error_1.AppError('config is required');
    }
    const config = value;
    if (type === database_1.AlertChannelType.TELEGRAM) {
        return {
            botToken: normalizeRequiredString(config.botToken, 'config.botToken'),
            chatId: normalizeRequiredString(config.chatId, 'config.chatId'),
        };
    }
    return {
        email: normalizeEmail(config.email),
    };
}
function normalizeOptionalEnabled(value) {
    if (value === undefined) {
        return undefined;
    }
    return Boolean(value);
}
function normalizeRequiredString(value, fieldName) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new app_error_1.AppError(`${fieldName} is required`);
    }
    return value.trim();
}
function normalizeEmail(value) {
    const email = normalizeRequiredString(value, 'config.email').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new app_error_1.AppError('config.email must be valid');
    }
    return email;
}
//# sourceMappingURL=alert-channel.validation.js.map