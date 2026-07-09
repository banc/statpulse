import { AlertChannelType } from '@statpulse/database';
import { AppError } from '../../shared/errors/app-error';

const MIN_COOLDOWN_SECONDS = 60;
const MAX_COOLDOWN_SECONDS = 24 * 60 * 60;
const DEFAULT_COOLDOWN_SECONDS = 300;

export type AlertChannelConfig = {
  botToken?: string;
  chatId?: string;
  email?: string;
};

export function normalizeAlertChannelType(value: unknown) {
  if (value !== AlertChannelType.TELEGRAM && value !== AlertChannelType.EMAIL) {
    throw new AppError('type must be TELEGRAM or EMAIL');
  }

  return value;
}

export function normalizeAlertChannelName(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError('name is required');
  }

  const name = value.trim();

  if (name.length > 120) {
    throw new AppError('name must be 120 characters or less');
  }

  return name;
}

export function normalizeCooldownSeconds(value: unknown) {
  if (value === undefined) {
    return DEFAULT_COOLDOWN_SECONDS;
  }

  const cooldownSeconds = Number(value);

  if (
    !Number.isInteger(cooldownSeconds) ||
    cooldownSeconds < MIN_COOLDOWN_SECONDS ||
    cooldownSeconds > MAX_COOLDOWN_SECONDS
  ) {
    throw new AppError(`cooldownSeconds must be between ${MIN_COOLDOWN_SECONDS} and ${MAX_COOLDOWN_SECONDS}`);
  }

  return cooldownSeconds;
}

export function normalizeAlertChannelConfig(type: AlertChannelType, value: unknown): AlertChannelConfig {
  if (typeof value !== 'object' || value === null) {
    throw new AppError('config is required');
  }

  const config = value as Record<string, unknown>;

  if (type === AlertChannelType.TELEGRAM) {
    return {
      botToken: normalizeRequiredString(config.botToken, 'config.botToken'),
      chatId: normalizeRequiredString(config.chatId, 'config.chatId'),
    };
  }

  return {
    email: normalizeEmail(config.email),
  };
}

export function normalizeOptionalEnabled(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  return Boolean(value);
}

function normalizeRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(`${fieldName} is required`);
  }

  return value.trim();
}

function normalizeEmail(value: unknown) {
  const email = normalizeRequiredString(value, 'config.email').toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('config.email must be valid');
  }

  return email;
}
