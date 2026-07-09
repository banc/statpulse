import { Request, Response } from 'express';
import { getAuthContext } from '../auth/auth.middleware';
import {
  createUserAlertChannel,
  getAlertDeliveryLogs,
  listAlertChannels,
  removeUserAlertChannel,
  updateUserAlertChannel,
} from './alert-channel.service';

export async function listAlertChannelsController(req: Request, res: Response) {
  const auth = getAuthContext(req);
  const channels = await listAlertChannels(auth.userId);

  res.json({ data: channels });
}

export async function createAlertChannelController(req: Request, res: Response) {
  const auth = getAuthContext(req);
  const channel = await createUserAlertChannel({
    userId: auth.userId,
    type: req.body.type,
    name: req.body.name,
    config: req.body.config,
    cooldownSeconds: req.body.cooldownSeconds,
  });

  res.status(201).json({ data: channel });
}

export async function updateAlertChannelController(req: Request, res: Response) {
  const auth = getAuthContext(req);
  const channel = await updateUserAlertChannel(auth.userId, req.params.id, {
    name: req.body.name,
    config: req.body.config,
    isEnabled: req.body.isEnabled,
    cooldownSeconds: req.body.cooldownSeconds,
  });

  res.json({ data: channel });
}

export async function deleteAlertChannelController(req: Request, res: Response) {
  const auth = getAuthContext(req);
  await removeUserAlertChannel(auth.userId, req.params.id);

  res.status(204).send();
}

export async function listAlertDeliveryLogsController(req: Request, res: Response) {
  const auth = getAuthContext(req);
  const logs = await getAlertDeliveryLogs({
    userId: auth.userId,
    limit: req.query.limit,
  });

  res.json({ data: logs });
}
