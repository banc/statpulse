import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler';
import { requireAuth } from '../auth/auth.middleware';
import {
  createAlertChannelController,
  deleteAlertChannelController,
  listAlertChannelsController,
  listAlertDeliveryLogsController,
  updateAlertChannelController,
} from './alert-channel.controller';

export const alertChannelRouter = Router();

alertChannelRouter.use(requireAuth);
alertChannelRouter.get('/', asyncHandler(listAlertChannelsController));
alertChannelRouter.post('/', asyncHandler(createAlertChannelController));
alertChannelRouter.get('/deliveries', asyncHandler(listAlertDeliveryLogsController));
alertChannelRouter.patch('/:id', asyncHandler(updateAlertChannelController));
alertChannelRouter.delete('/:id', asyncHandler(deleteAlertChannelController));
