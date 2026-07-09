import { Request, Response } from 'express';
import { getAuthContext } from '../auth/auth.middleware';
import {
  createHttpMonitor,
  getMonitorIncidents,
  getMonitorMetrics,
  getMonitorResults,
  listMonitors,
  removeHttpMonitor,
  updateHttpMonitor,
} from './monitor.service';

export async function listMonitorsController(req: Request, res: Response) {
  const auth = getAuthContext(req);
  const monitors = await listMonitors(auth.userId);
  res.json({ data: monitors });
}

export async function createMonitorController(req: Request, res: Response) {
  const auth = getAuthContext(req);
  const monitor = await createHttpMonitor({
    userId: auth.userId,
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
  const auth = getAuthContext(req);
  const results = await getMonitorResults({
    userId: auth.userId,
    monitorId: req.params.id,
    limit: req.query.limit,
  });

  res.json({ data: results });
}

export async function listMonitorIncidentsController(req: Request, res: Response) {
  const auth = getAuthContext(req);
  const incidents = await getMonitorIncidents({
    userId: auth.userId,
    monitorId: req.params.id,
    limit: req.query.limit,
  });

  res.json({ data: incidents });
}

export async function listMonitorMetricsController(req: Request, res: Response) {
  const auth = getAuthContext(req);
  const metrics = await getMonitorMetrics({
    userId: auth.userId,
    monitorId: req.params.id,
    from: req.query.from,
    to: req.query.to,
    bucketSeconds: req.query.bucketSeconds,
  });

  res.json({ data: metrics });
}

export async function updateMonitorController(req: Request, res: Response) {
  const auth = getAuthContext(req);
  const monitor = await updateHttpMonitor(auth.userId, req.params.id, {
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
  const auth = getAuthContext(req);
  await removeHttpMonitor(auth.userId, req.params.id);
  res.status(204).send();
}
