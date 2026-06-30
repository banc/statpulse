import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler';
import {
  createMonitorController,
  deleteMonitorController,
  listMonitorResultsController,
  listMonitorsController,
  updateMonitorController,
} from './monitor.controller';

export const monitorRouter = Router();

monitorRouter.get('/', asyncHandler(listMonitorsController));
monitorRouter.post('/', asyncHandler(createMonitorController));
monitorRouter.get('/:id/results', asyncHandler(listMonitorResultsController));
monitorRouter.patch('/:id', asyncHandler(updateMonitorController));
monitorRouter.delete('/:id', asyncHandler(deleteMonitorController));
