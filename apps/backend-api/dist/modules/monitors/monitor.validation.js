"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUrl = normalizeUrl;
exports.normalizeIntervalSeconds = normalizeIntervalSeconds;
exports.normalizeResultsLimit = normalizeResultsLimit;
const app_error_1 = require("../../shared/errors/app-error");
const MIN_INTERVAL_SECONDS = 30;
const DEFAULT_INTERVAL_SECONDS = 60;
function normalizeUrl(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new app_error_1.AppError('URL is required');
    }
    let url;
    try {
        url = new URL(value.trim());
    }
    catch {
        throw new app_error_1.AppError('URL must be valid');
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new app_error_1.AppError('Only HTTP and HTTPS URLs are supported for MVP');
    }
    return url.toString();
}
function normalizeIntervalSeconds(value) {
    if (value === undefined) {
        return DEFAULT_INTERVAL_SECONDS;
    }
    const intervalSeconds = Number(value);
    if (!Number.isInteger(intervalSeconds) || intervalSeconds < MIN_INTERVAL_SECONDS) {
        throw new app_error_1.AppError(`intervalSeconds must be at least ${MIN_INTERVAL_SECONDS}`);
    }
    return intervalSeconds;
}
function normalizeResultsLimit(value) {
    const limit = Number(value || 50);
    if (!Number.isFinite(limit) || limit <= 0) {
        return 50;
    }
    return Math.min(limit, 200);
}
//# sourceMappingURL=monitor.validation.js.map