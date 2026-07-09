import { Request, Response } from 'express';
import {
  createHttpMonitor,
  getMonitorIncidents,
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
    name: req.body.name,
    url: req.body.url,
    method: req.body.method,
    expectedStatus: req.body.expectedStatus,
    intervalSeconds: req.body.intervalSeconds,
    timeoutMs: req.body.timeoutMs,
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

export async function listMonitorIncidentsController(req: Request, res: Response) {
  const incidents = await getMonitorIncidents({
    monitorId: req.params.id,
    limit: req.query.limit,
  });

  res.json({ data: incidents });
}

export async function updateMonitorController(req: Request, res: Response) {
  const monitor = await updateHttpMonitor(req.params.id, {
    name: req.body.name,
    url: req.body.url,
    method: req.body.method,
    expectedStatus: req.body.expectedStatus,
    intervalSeconds: req.body.intervalSeconds,
    timeoutMs: req.body.timeoutMs,
    isActive: req.body.isActive,
  });

  res.json({ data: monitor });
}

export async function deleteMonitorController(req: Request, res: Response) {
  await removeHttpMonitor(req.params.id);
  res.status(204).send();
}
