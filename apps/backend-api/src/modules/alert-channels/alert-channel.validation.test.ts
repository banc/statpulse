import { AlertChannelType } from '@statpulse/database';
import { describe, expect, it } from 'vitest';
import {
  normalizeAlertChannelConfig,
  normalizeAlertChannelName,
  normalizeAlertChannelType,
  normalizeCooldownSeconds,
} from './alert-channel.validation';

describe('alert channel validation', () => {
  it('normalizes Telegram config', () => {
    expect(
      normalizeAlertChannelConfig(AlertChannelType.TELEGRAM, {
        botToken: ' token ',
        chatId: ' 123 ',
      }),
    ).toEqual({
      botToken: 'token',
      chatId: '123',
    });
  });

  it('normalizes email config', () => {
    expect(
      normalizeAlertChannelConfig(AlertChannelType.EMAIL, {
        email: ' USER@Example.COM ',
      }),
    ).toEqual({
      email: 'user@example.com',
    });
  });

  it('rejects invalid channel type', () => {
    expect(() => normalizeAlertChannelType('WEBHOOK')).toThrow('type must be TELEGRAM or EMAIL');
  });

  it('rejects invalid email config', () => {
    expect(() => normalizeAlertChannelConfig(AlertChannelType.EMAIL, { email: 'not-email' })).toThrow(
      'config.email must be valid',
    );
  });

  it('rejects missing Telegram secrets', () => {
    expect(() => normalizeAlertChannelConfig(AlertChannelType.TELEGRAM, { chatId: '123' })).toThrow(
      'config.botToken is required',
    );
  });

  it('normalizes channel names and cooldowns', () => {
    expect(normalizeAlertChannelName(' Ops ')).toBe('Ops');
    expect(normalizeCooldownSeconds(undefined)).toBe(300);
    expect(normalizeCooldownSeconds('600')).toBe(600);
  });

  it.each([59, 86401])('rejects cooldown outside supported bounds: %s', (cooldownSeconds) => {
    expect(() => normalizeCooldownSeconds(cooldownSeconds)).toThrow('cooldownSeconds must be between 60 and 86400');
  });
});
