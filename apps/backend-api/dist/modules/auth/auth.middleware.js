"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.getAuthContext = getAuthContext;
const app_error_1 = require("../../shared/errors/app-error");
const token_service_1 = require("./token.service");
function requireAuth(req, _res, next) {
    const authorization = req.header('authorization');
    const [scheme, token] = authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
        throw new app_error_1.AppError('Authorization token is required', 401);
    }
    const payload = (0, token_service_1.verifyAuthToken)(token);
    req.auth = {
        userId: payload.sub,
        email: payload.email,
    };
    next();
}
function getAuthContext(req) {
    const auth = req.auth;
    if (!auth) {
        throw new app_error_1.AppError('Authorization token is required', 401);
    }
    return auth;
}
//# sourceMappingURL=auth.middleware.js.map