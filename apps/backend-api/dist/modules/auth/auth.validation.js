"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeEmail = normalizeEmail;
exports.normalizePassword = normalizePassword;
const app_error_1 = require("../../shared/errors/app-error");
const MIN_PASSWORD_LENGTH = 8;
function normalizeEmail(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new app_error_1.AppError('email is required');
    }
    const email = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new app_error_1.AppError('email must be valid');
    }
    return email;
}
function normalizePassword(value) {
    if (typeof value !== 'string') {
        throw new app_error_1.AppError('password is required');
    }
    if (value.length < MIN_PASSWORD_LENGTH) {
        throw new app_error_1.AppError(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    return value;
}
//# sourceMappingURL=auth.validation.js.map