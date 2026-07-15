export type MonitorStatus = 'UNKNOWN' | 'UP' | 'DEGRADED' | 'DOWN';

export type Monitor = {
  id: string;
  name: string;
  url: string;
  region: string;
  method: string;
  status: MonitorStatus;
  uptime: number;
  latency: number;
  expectedStatus: number;
  intervalSeconds?: number;
  timeoutMs?: number;
  isActive?: boolean;
  checks: number[];
  incidents: number;
  lastChecked: string;
};

export type Incident = {
  id: string;
  monitor: string;
  title: string;
  status: 'open' | 'resolved';
  startedAt: string;
  duration: string;
};

export type Delivery = {
  id: string;
  channel: string;
  event: string;
  status: 'sent' | 'skipped' | 'failed';
  time: string;
};

export type SummaryTone = 'teal' | 'indigo' | 'rose';

export type NewMonitorInput = {
  name?: string;
  url: string;
  method: 'GET' | 'HEAD';
  expectedStatus: number;
  intervalSeconds: number;
  timeoutMs: number;
};
