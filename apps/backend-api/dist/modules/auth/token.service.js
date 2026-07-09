"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueAuthToken = issueAuthToken;
exports.verifyAuthToken = verifyAuthToken;
const crypto_1 = require("crypto");
const env_1 = require("../../config/env");
const app_error_1 = require("../../shared/errors/app-error");
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
function encodeBase64Url(value) {
    return Buffer.from(value).toString('base64url');
}
function sign(value) {
    return (0, crypto_1.createHmac)('sha256', env_1.env.jwtSecret).update(value).digest('base64url');
}
function issueAuthToken(user) {
    const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = encodeBase64Url(JSON.stringify({
        sub: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    }));
    const unsignedToken = `${header}.${payload}`;
    return `${unsignedToken}.${sign(unsignedToken)}`;
}
function verifyAuthToken(token) {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
        throw new app_error_1.AppError('Invalid authorization token', 401);
    }
    const expectedSignature = sign(`${header}.${payload}`);
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);
    if (signatureBuffer.length !== expectedSignatureBuffer.length ||
        !(0, crypto_1.timingSafeEqual)(signatureBuffer, expectedSignatureBuffer)) {
        throw new app_error_1.AppError('Invalid authorization token', 401);
    }
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.sub || !decoded.email || !decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
        throw new app_error_1.AppError('Invalid authorization token', 401);
    }
    return decoded;
}
//# sourceMappingURL=token.service.js.map