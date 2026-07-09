"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = registerController;
exports.loginController = loginController;
exports.meController = meController;
const auth_middleware_1 = require("./auth.middleware");
const auth_service_1 = require("./auth.service");
async function registerController(req, res) {
    const result = await (0, auth_service_1.registerUser)({
        email: req.body.email,
        password: req.body.password,
    });
    res.status(201).json({ data: result });
}
async function loginController(req, res) {
    const result = await (0, auth_service_1.loginUser)({
        email: req.body.email,
        password: req.body.password,
    });
    res.json({ data: result });
}
async function meController(req, res) {
    const auth = (0, auth_middleware_1.getAuthContext)(req);
    const user = await (0, auth_service_1.getCurrentUser)(auth.userId);
    res.json({ data: user });
}
//# sourceMappingURL=auth.controller.js.map