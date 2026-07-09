"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverAlertEvent = deliverAlertEvent;
const database_1 = require("@statpulse/database");
const alert_events_1 = require("./alert-events");
async function deliverAlertEvent(event) {
    const channels = await database_1.prisma.alertChannel.findMany({
        where: {
            userId: event.userId,
            isEnabled: true,
        },
    });
    await Promise.all(channels.map((channel) => deliverToChannel(event, channel)));
}
async function deliverToChannel(event, channel) {
    const now = new Date();
    const message = (0, alert_events_1.formatAlertMessage)(event);
    if ((0, alert_events_1.shouldSkipForCooldown)(channel, now)) {
        await createDeliveryLog(event, channel.id, database_1.AlertDeliveryStatus.SKIPPED, message, 'Cooldown active');
        return;
    }
    try {
        const providerResponse = await sendChannelMessage(channel, message);
        await database_1.prisma.$transaction([
            database_1.prisma.alertDeliveryLog.create({
                data: {
                    alertChannelId: channel.id,
                    monitorId: event.monitorId,
                    incidentId: event.incidentId,
                    eventType: event.type,
                    status: database_1.AlertDeliveryStatus.SENT,
                    message,
                    providerResponse,
                },
            }),
            database_1.prisma.alertChannel.update({
                where: { id: channel.id },
                data: { lastSentAt: now },
            }),
        ]);
    }
    catch (error) {
        await createDeliveryLog(event, channel.id, database_1.AlertDeliveryStatus.FAILED, message, getErrorMessage(error));
    }
}
async function sendChannelMessage(channel, message) {
    const config = channel.config;
    if (channel.type === database_1.AlertChannelType.TELEGRAM) {
        const botToken = String(config.botToken || '');
        const chatId = String(config.chatId || '');
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                disable_web_page_preview: true,
            }),
        });
        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(`Telegram delivery failed: ${response.status} ${responseText}`);
        }
        return responseText;
    }
    console.log(`[Alert email:${String(config.email || 'unknown')}] ${message}`);
    return 'Email delivery logged locally';
}
function createDeliveryLog(event, alertChannelId, status, message, providerResponse) {
    return database_1.prisma.alertDeliveryLog.create({
        data: {
            alertChannelId,
            monitorId: event.monitorId,
            incidentId: event.incidentId,
            eventType: event.type,
            status,
            message,
            providerResponse,
        },
    });
}
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return 'Unknown alert delivery error';
}
//# sourceMappingURL=alert-delivery.js.map