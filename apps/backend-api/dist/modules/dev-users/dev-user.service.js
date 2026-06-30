"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDevUser = ensureDevUser;
const database_1 = require("@statpulse/database");
const env_1 = require("../../config/env");
async function ensureDevUser() {
    return database_1.prisma.user.upsert({
        where: { email: env_1.env.devUserEmail },
        update: {},
        create: {
            email: env_1.env.devUserEmail,
            passwordHash: 'dev-only-password-placeholder',
        },
    });
}
//# sourceMappingURL=dev-user.service.js.map