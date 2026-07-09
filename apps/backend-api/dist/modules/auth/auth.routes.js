"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const async_handler_1 = require("../../shared/http/async-handler");
const auth_middleware_1 = require("./auth.middleware");
const auth_controller_1 = require("./auth.controller");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', (0, async_handler_1.asyncHandler)(auth_controller_1.registerController));
exports.authRouter.post('/login', (0, async_handler_1.asyncHandler)(auth_controller_1.loginController));
exports.authRouter.get('/me', auth_middleware_1.requireAuth, (0, async_handler_1.asyncHandler)(auth_controller_1.meController));
//# sourceMappingURL=auth.routes.js.map