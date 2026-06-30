"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const app_error_1 = require("../errors/app-error");
function errorHandler(error, _req, res, _next) {
    void _next;
    const statusCode = error instanceof app_error_1.AppError ? error.statusCode : 500;
    console.error('🚨 [API]', error);
    res.status(statusCode).json({
        error: error.message || 'Unexpected API error',
    });
}
//# sourceMappingURL=error-handler.js.map