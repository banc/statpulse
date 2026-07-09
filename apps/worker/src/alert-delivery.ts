import { AlertDeliveryStatus, AlertChannelType, prisma } from '@statpulse/database';
import { AlertEvent, DeliverableAlertChannel, formatAlertMessage, shouldSkipForCooldown } from './alert-events';

export async function deliverAlertEvent(event: AlertEvent) {
  const channels = await prisma.alertChannel.findMany({
    where: {
      userId: event.userId,
      isEnabled: true,
    },
  });

  await Promise.all(channels.map((channel) => deliverToChannel(event, channel)));
}

async function deliverToChannel(event: AlertEvent, channel: DeliverableAlertChannel) {
  const now = new Date();
  const message = formatAlertMessage(event);

  if (shouldSkipForCooldown(channel, now)) {
    await createDeliveryLog(event, channel.id, AlertDeliveryStatus.SKIPPED, message, 'Cooldown active');
    return;
  }

  try {
    const providerResponse = await sendChannelMessage(channel, message);

    await prisma.$transaction([
      prisma.alertDeliveryLog.create({
        data: {
          alertChannelId: channel.id,
          monitorId: event.monitorId,
          incidentId: event.incidentId,
          eventType: event.type,
          status: AlertDeliveryStatus.SENT,
          message,
          providerResponse,
        },
      }),
      prisma.alertChannel.update({
        where: { id: channel.id },
        data: { lastSentAt: now },
      }),
    ]);
  } catch (error) {
    await createDeliveryLog(event, channel.id, AlertDeliveryStatus.FAILED, message, getErrorMessage(error));
  }
}

async function sendChannelMessage(channel: DeliverableAlertChannel, message: string) {
  const config = channel.config as Record<string, unknown>;

  if (channel.type === AlertChannelType.TELEGRAM) {
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

function createDeliveryLog(
  event: AlertEvent,
  alertChannelId: string,
  status: AlertDeliveryStatus,
  message: string,
  providerResponse: string,
) {
  return prisma.alertDeliveryLog.create({
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown alert delivery error';
}
