"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getCurrentUser = getCurrentUser;
const app_error_1 = require("../../shared/errors/app-error");
const auth_repository_1 = require("./auth.repository");
const password_service_1 = require("./password.service");
const token_service_1 = require("./token.service");
const auth_validation_1 = require("./auth.validation");
function toAuthResponse(user) {
    return {
        user,
        token: (0, token_service_1.issueAuthToken)(user),
    };
}
async function registerUser(input) {
    const email = (0, auth_validation_1.normalizeEmail)(input.email);
    const password = (0, auth_validation_1.normalizePassword)(input.password);
    const existingUser = await (0, auth_repository_1.findUserByEmail)(email);
    if (existingUser) {
        throw new app_error_1.AppError('email is already registered', 409);
    }
    const user = await (0, auth_repository_1.createUser)({
        email,
        passwordHash: await (0, password_service_1.hashPassword)(password),
    });
    return toAuthResponse(user);
}
async function loginUser(input) {
    const email = (0, auth_validation_1.normalizeEmail)(input.email);
    const password = (0, auth_validation_1.normalizePassword)(input.password);
    const user = await (0, auth_repository_1.findUserByEmail)(email);
    if (!user || !(await (0, password_service_1.verifyPassword)(password, user.passwordHash))) {
        throw new app_error_1.AppError('Invalid email or password', 401);
    }
    return toAuthResponse({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
    });
}
async function getCurrentUser(userId) {
    const user = await (0, auth_repository_1.findUserById)(userId);
    if (!user) {
        throw new app_error_1.AppError('User not found', 401);
    }
    return user;
}
//# sourceMappingURL=auth.service.js.map