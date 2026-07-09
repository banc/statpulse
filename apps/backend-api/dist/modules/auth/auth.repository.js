"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.createUser = createUser;
const database_1 = require("@statpulse/database");
function findUserByEmail(email) {
    return database_1.prisma.user.findUnique({
        where: { email },
    });
}
function findUserById(id) {
    return database_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            createdAt: true,
        },
    });
}
function createUser(data) {
    return database_1.prisma.user.create({
        data,
        select: {
            id: true,
            email: true,
            createdAt: true,
        },
    });
}
//# sourceMappingURL=auth.repository.js.map