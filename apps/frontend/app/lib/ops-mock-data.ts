export type TimePeriod = '1h' | '12h' | '24h';

export type OpsIncidentStatus = 'Open' | 'Resolved';

export type OpsIncident = {
  id: string;
  monitorId: string;
  monitorName: string;
  status: OpsIncidentStatus;
  startedAt: string;
  resolvedAt: string | null;
  reason: string;
  createdAt: string;
  updatedAt: string;
  minutesAgo: number;
  durationMinutes: number;
  description: string;
  timeline: Array<{
    label: string;
    time: string;
    tone: 'danger' | 'warning' | 'info' | 'success';
  }>;
};

export const periodOptions: Array<{ id: TimePeriod; label: string }> = [
  { id: '1h', label: 'Last hour' },
  { id: '12h', label: 'Last 12 hours' },
  { id: '24h', label: 'Last 24 hours' },
];

const titles = [
  'Database latency spike in us-east-1',
  'Payment gateway timeout errors',
  'CDN cache invalidation delay',
  'Auth service memory leak',
  'Checkout API elevated 5xx rate',
  'Webhook delivery queue backlog',
  'Search cluster read saturation',
  'Billing worker retry storm',
  'Session service connection pool pressure',
  'Image processor CPU throttling',
];

const services = [
  ['mon-checkout-api', 'Checkout API'],
  ['mon-payment-service', 'Payment Service'],
  ['mon-order-service', 'Order Service'],
  ['mon-auth-service', 'Auth Service'],
  ['mon-cdn-edge', 'CDN Edge'],
  ['mon-webhook-relay', 'Webhook Relay'],
  ['mon-billing-worker', 'Billing Worker'],
  ['mon-search-api', 'Search API'],
  ['mon-notification-service', 'Notification Service'],
  ['mon-media-pipeline', 'Media Pipeline'],
  ['mon-core-api', 'Core API'],
  ['mon-docs-portal', 'Docs Portal'],
  ['mon-admin-console', 'Admin Console'],
  ['mon-status-page', 'Status Page'],
  ['mon-public-site', 'Public Site'],
  ['mon-ingestion-api', 'Ingestion API'],
  ['mon-metrics-api', 'Metrics API'],
  ['mon-alert-router', 'Alert Router'],
  ['mon-region-eu', 'EU Region Probe'],
  ['mon-region-us', 'US Region Probe'],
  ['mon-region-apac', 'APAC Region Probe'],
] as const;

const statuses: OpsIncidentStatus[] = ['Open', 'Open', 'Open', 'Resolved'];
const now = new Date('2026-07-15T12:00:00.000Z').getTime();

export const mockIncidents: OpsIncident[] = Array.from({ length: 100 }, (_, index) => {
  const minutesAgo = 12 + index * 13;
  const status = statuses[index % statuses.length];
  const monitor = services[index % services.length];
  const durationMinutes = 18 + ((index * 7) % 280);
  const startedAtDate = new Date(now - minutesAgo * 60_000);
  const resolvedAtDate = status === 'Resolved' ? new Date(startedAtDate.getTime() + durationMinutes * 60_000) : null;
  const updatedAtDate = resolvedAtDate ?? new Date(now - Math.max(minutesAgo - 5, 1) * 60_000);
  const reason = titles[index % titles.length];

  return {
    id: `INC-${2847 - index}`,
    monitorId: monitor[0],
    monitorName: monitor[1],
    status,
    startedAt: startedAtDate.toISOString(),
    resolvedAt: resolvedAtDate?.toISOString() ?? null,
    reason,
    createdAt: startedAtDate.toISOString(),
    updatedAt: updatedAtDate.toISOString(),
    minutesAgo,
    durationMinutes,
    description: `${monitor[1]} reported an incident: ${reason}. The display is based on the Incident model fields and derives status from resolvedAt.`,
    timeline: [
      { label: 'Incident started', time: formatIncidentAge(minutesAgo), tone: 'warning' },
      { label: 'Incident created', time: formatIncidentAge(Math.max(minutesAgo - 1, 1)), tone: 'info' },
      {
        label: status === 'Resolved' ? 'Incident resolved' : 'resolvedAt is empty',
        time: status === 'Resolved' ? formatIncidentAge(Math.max(minutesAgo - durationMinutes, 1)) : 'open',
        tone: status === 'Resolved' ? 'success' : 'warning',
      },
    ],
  };
});

export const performanceDataByPeriod: Record<
  TimePeriod,
  {
    labels: string[];
    p50: number[];
    p95: number[];
    p99: number[];
    throughput: number[];
    errorRate: number;
  }
> = {
  '1h': {
    labels: ['-60m', '-45m', '-30m', '-15m', 'Now'],
    p50: [42, 45, 49, 52, 48],
    p95: [118, 122, 135, 132, 126],
    p99: [238, 251, 276, 262, 249],
    throughput: [9200, 10800, 14100, 16900, 15200],
    errorRate: 0.28,
  },
  '12h': {
    labels: ['00:00', '03:00', '06:00', '09:00', '12:00', 'Now'],
    p50: [44, 41, 56, 68, 61, 52],
    p95: [116, 111, 141, 162, 151, 132],
    p99: [236, 224, 292, 348, 307, 276],
    throughput: [12000, 8400, 15200, 26100, 31600, 22100],
    errorRate: 0.36,
  },
  '24h': {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
    p50: [48, 42, 59, 72, 64, 51, 56],
    p95: [121, 112, 147, 168, 151, 126, 132],
    p99: [246, 224, 302, 342, 309, 267, 276],
    throughput: [12000, 8200, 24100, 31200, 29200, 19800, 22100],
    errorRate: 0.42,
  },
};

export const serviceLatencies = [
  { service: 'API Gateway', p50: 45, p95: 142, p99: 289, status: 'healthy' },
  { service: 'Checkout API', p50: 62, p95: 188, p99: 412, status: 'watching' },
  { service: 'Payment Service', p50: 73, p95: 214, p99: 486, status: 'degraded' },
  { service: 'Auth Service', p50: 39, p95: 116, p99: 236, status: 'healthy' },
  { service: 'Webhook Relay', p50: 58, p95: 167, p99: 342, status: 'watching' },
];

export function getIncidentsForPeriod(period: TimePeriod) {
  const maxAgeByPeriod: Record<TimePeriod, number> = {
    '1h': 60,
    '12h': 720,
    '24h': 1440,
  };

  return mockIncidents.filter((incident) => incident.minutesAgo <= maxAgeByPeriod[period]);
}

function formatIncidentAge(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}
