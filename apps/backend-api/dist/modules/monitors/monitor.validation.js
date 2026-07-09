"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUrl = normalizeUrl;
exports.normalizeIntervalSeconds = normalizeIntervalSeconds;
exports.normalizeName = normalizeName;
exports.normalizeHttpMethod = normalizeHttpMethod;
exports.normalizeExpectedStatus = normalizeExpectedStatus;
exports.normalizeTimeoutMs = normalizeTimeoutMs;
exports.normalizeResultsLimit = normalizeResultsLimit;
const app_error_1 = require("../../shared/errors/app-error");
const MIN_INTERVAL_SECONDS = 30;
const DEFAULT_INTERVAL_SECONDS = 60;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 30000;
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_EXPECTED_STATUS = 200;
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
function normalizeName(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    if (typeof value !== 'string') {
        throw new app_error_1.AppError('name must be a string');
    }
    const name = value.trim();
    if (name.length === 0) {
        return undefined;
    }
    if (name.length > 120) {
        throw new app_error_1.AppError('name must be 120 characters or less');
    }
    return name;
}
function normalizeHttpMethod(value) {
    if (value === undefined) {
        return 'GET';
    }
    if (value !== 'GET' && value !== 'HEAD') {
        throw new app_error_1.AppError('method must be GET or HEAD');
    }
    return value;
}
function normalizeExpectedStatus(value) {
    if (value === undefined) {
        return DEFAULT_EXPECTED_STATUS;
    }
    const expectedStatus = Number(value);
    if (!Number.isInteger(expectedStatus) || expectedStatus < 100 || expectedStatus > 599) {
        throw new app_error_1.AppError('expectedStatus must be a valid HTTP status code');
    }
    return expectedStatus;
}
function normalizeTimeoutMs(value) {
    if (value === undefined) {
        return DEFAULT_TIMEOUT_MS;
    }
    const timeoutMs = Number(value);
    if (!Number.isInteger(timeoutMs) || timeoutMs < MIN_TIMEOUT_MS || timeoutMs > MAX_TIMEOUT_MS) {
        throw new app_error_1.AppError(`timeoutMs must be between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS}`);
    }
    return timeoutMs;
}
function normalizeResultsLimit(value) {
    const limit = Number(value || 50);
    if (!Number.isFinite(limit) || limit <= 0) {
        return 50;
    }
    return Math.min(limit, 200);
}
//# sourceMappingURL=monitor.validation.js.map