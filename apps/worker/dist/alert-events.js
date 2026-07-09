"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldSkipForCooldown = shouldSkipForCooldown;
exports.formatAlertMessage = formatAlertMessage;
function shouldSkipForCooldown(channel, now) {
    if (!channel.lastSentAt) {
        return false;
    }
    return now.getTime() - channel.lastSentAt.getTime() < channel.cooldownSeconds * 1000;
}
function formatAlertMessage(event) {
    const label = event.type === 'INCIDENT_OPENED' ? 'DOWN' : 'RESOLVED';
    const title = event.monitorName || event.monitorUrl;
    const reason = event.reason ? `\nReason: ${event.reason}` : '';
    return `[StatPulse] ${label}: ${title}\nURL: ${event.monitorUrl}\nTime: ${event.occurredAt.toISOString()}${reason}`;
}
//# sourceMappingURL=alert-events.js.map