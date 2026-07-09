import { AlertChannel, AlertChannelType } from '@statpulse/database';
import { AppError } from '../../shared/errors/app-error';
import {
  createAlertChannel,
  deleteAlertChannel,
  findUserAlertChannelById,
  listAlertDeliveryLogs,
  listUserAlertChannels,
  updateAlertChannel,
  UpdateAlertChannelData,
} from './alert-channel.repository';
import {
  normalizeAlertChannelConfig,
  normalizeAlertChannelName,
  normalizeAlertChannelType,
  normalizeCooldownSeconds,
  normalizeOptionalEnabled,
} from './alert-channel.validation';

export async function listAlertChannels(userId: string) {
  const channels = await listUserAlertChannels(userId);

  return channels.map(toAlertChannelResponse);
}

export async function createUserAlertChannel(input: {
  userId: string;
  type: unknown;
  name: unknown;
  config: unknown;
  cooldownSeconds: unknown;
}) {
  const type = normalizeAlertChannelType(input.type);
  const channel = await createAlertChannel({
    userId: input.userId,
    type,
    name: normalizeAlertChannelName(input.name),
    config: normalizeAlertChannelConfig(type, input.config),
    cooldownSeconds: normalizeCooldownSeconds(input.cooldownSeconds),
  });

  return toAlertChannelResponse(channel);
}

export async function updateUserAlertChannel(
  userId: string,
  id: string,
  input: {
    name?: unknown;
    config?: unknown;
    isEnabled?: unknown;
    cooldownSeconds?: unknown;
  },
) {
  const existing = await assertUserAlertChannel(userId, id);
  const data: UpdateAlertChannelData = {};

  if (input.name !== undefined) {
    data.name = normalizeAlertChannelName(input.name);
  }

  if (input.config !== undefined) {
    data.config = normalizeAlertChannelConfig(existing.type, input.config);
  }

  if (input.isEnabled !== undefined) {
    data.isEnabled = normalizeOptionalEnabled(input.isEnabled);
  }

  if (input.cooldownSeconds !== undefined) {
    data.cooldownSeconds = normalizeCooldownSeconds(input.cooldownSeconds);
  }

  const channel = await updateAlertChannel(id, data);

  return toAlertChannelResponse(channel);
}

export async function removeUserAlertChannel(userId: string, id: string) {
  await assertUserAlertChannel(userId, id);
  await deleteAlertChannel(id);
}

export async function getAlertDeliveryLogs(input: { userId: string; limit: unknown }) {
  return listAlertDeliveryLogs(input.userId, normalizeDeliveryLogLimit(input.limit));
}

async function assertUserAlertChannel(userId: string, id: string) {
  const channel = await findUserAlertChannelById(userId, id);

  if (!channel) {
    throw new AppError('Alert channel not found', 404);
  }

  return channel;
}

function toAlertChannelResponse(channel: AlertChannel) {
  const config = channel.config as Record<string, unknown>;

  return {
    id: channel.id,
    type: channel.type,
    name: channel.name,
    isEnabled: channel.isEnabled,
    cooldownSeconds: channel.cooldownSeconds,
    lastSentAt: channel.lastSentAt,
    createdAt: channel.createdAt,
    updatedAt: channel.updatedAt,
    config: summarizeConfig(channel.type, config),
  };
}

function summarizeConfig(type: AlertChannelType, config: Record<string, unknown>) {
  if (type === AlertChannelType.TELEGRAM) {
    return {
      chatId: config.chatId,
      botTokenConfigured: typeof config.botToken === 'string' && config.botToken.length > 0,
    };
  }

  return {
    email: config.email,
  };
}

function normalizeDeliveryLogLimit(value: unknown) {
  const limit = Number(value || 50);

  if (!Number.isFinite(limit) || limit <= 0) {
    return 50;
  }

  return Math.min(limit, 200);
}
