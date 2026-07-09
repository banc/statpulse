import { AlertChannelType, prisma } from '@statpulse/database';
import { AlertChannelConfig } from './alert-channel.validation';

export type CreateAlertChannelData = {
  userId: string;
  type: AlertChannelType;
  name: string;
  config: AlertChannelConfig;
  cooldownSeconds: number;
};

export type UpdateAlertChannelData = {
  name?: string;
  config?: AlertChannelConfig;
  isEnabled?: boolean;
  cooldownSeconds?: number;
};

export function listUserAlertChannels(userId: string) {
  return prisma.alertChannel.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export function createAlertChannel(data: CreateAlertChannelData) {
  return prisma.alertChannel.create({
    data,
  });
}

export function findUserAlertChannelById(userId: string, id: string) {
  return prisma.alertChannel.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export function updateAlertChannel(id: string, data: UpdateAlertChannelData) {
  return prisma.alertChannel.update({
    where: { id },
    data,
  });
}

export function deleteAlertChannel(id: string) {
  return prisma.alertChannel.delete({
    where: { id },
  });
}

export function listAlertDeliveryLogs(userId: string, limit: number) {
  return prisma.alertDeliveryLog.findMany({
    where: {
      alertChannel: {
        userId,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
