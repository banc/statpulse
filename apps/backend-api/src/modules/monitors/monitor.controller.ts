import { Request, Response } from 'express';
import {
  createHttpMonitor,
  getMonitorResults,
  listMonitors,
  removeHttpMonitor,
  updateHttpMonitor,
} from './monitor.service';

export async function listMonitorsController(_req: Request, res: Response) {
  const monitors = await listMonitors();
  res.json({ data: monitors });
}

export async function createMonitorController(req: Request, res: Response) {
  const monitor = await createHttpMonitor({
    url: req.body.url,
    intervalSeconds: req.body.intervalSeconds,
  });

  res.status(201).json({ data: monitor });
}

export async function listMonitorResultsController(req: Request, res: Response) {
  const results = await getMonitorResults({
    monitorId: req.params.id,
    limit: req.query.limit,
  });

  res.json({ data: results });
}

export async function updateMonitorController(req: Request, res: Response) {
  const monitor = await updateHttpMonitor(req.params.id, {
    url: req.body.url,
    intervalSeconds: req.body.intervalSeconds,
    isActive: req.body.isActive,
  });

  res.json({ data: monitor });
}

export async function deleteMonitorController(req: Request, res: Response) {
  await removeHttpMonitor(req.params.id);
  res.status(204).send();
}
