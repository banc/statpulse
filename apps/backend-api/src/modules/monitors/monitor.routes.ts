import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler';
import { requireAuth } from '../auth/auth.middleware';
import {
  createMonitorController,
  deleteMonitorController,
  listMonitorIncidentsController,
  listMonitorMetricsController,
  listMonitorResultsController,
  listMonitorsController,
  updateMonitorController,
} from './monitor.controller';

export const monitorRouter = Router();

monitorRouter.use(requireAuth);
monitorRouter.get('/', asyncHandler(listMonitorsController));
monitorRouter.post('/', asyncHandler(createMonitorController));
monitorRouter.get('/:id/results', asyncHandler(listMonitorResultsController));
monitorRouter.get('/:id/incidents', asyncHandler(listMonitorIncidentsController));
monitorRouter.get('/:id/metrics', asyncHandler(listMonitorMetricsController));
monitorRouter.patch('/:id', asyncHandler(updateMonitorController));
monitorRouter.delete('/:id', asyncHandler(deleteMonitorController));
