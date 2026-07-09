"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserAlertChannels = listUserAlertChannels;
exports.createAlertChannel = createAlertChannel;
exports.findUserAlertChannelById = findUserAlertChannelById;
exports.updateAlertChannel = updateAlertChannel;
exports.deleteAlertChannel = deleteAlertChannel;
exports.listAlertDeliveryLogs = listAlertDeliveryLogs;
const database_1 = require("@statpulse/database");
function listUserAlertChannels(userId) {
    return database_1.prisma.alertChannel.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}
function createAlertChannel(data) {
    return database_1.prisma.alertChannel.create({
        data,
    });
}
function findUserAlertChannelById(userId, id) {
    return database_1.prisma.alertChannel.findFirst({
        where: {
            id,
            userId,
        },
    });
}
function updateAlertChannel(id, data) {
    return database_1.prisma.alertChannel.update({
        where: { id },
        data,
    });
}
function deleteAlertChannel(id) {
    return database_1.prisma.alertChannel.delete({
        where: { id },
    });
}
function listAlertDeliveryLogs(userId, limit) {
    return database_1.prisma.alertDeliveryLog.findMany({
        where: {
            alertChannel: {
                userId,
            },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}
//# sourceMappingURL=alert-channel.repository.js.map