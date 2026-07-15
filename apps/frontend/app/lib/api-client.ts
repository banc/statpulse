import { deliveries, incidents, monitors } from './dashboard-data';
import type { Delivery, Incident, Monitor, MonitorStatus, NewMonitorInput } from './dashboard-types';

type ApiUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type AuthSession = {
  user: ApiUser;
  token: string;
};

export type DashboardApiSnapshot = {
  user: ApiUser;
  monitors: Monitor[];
  selectedIncidents: Incident[];
  deliveries: Delivery[];
};

type LocalWorkspace = {
  user: ApiUser;
  monitors: Monitor[];
  incidents: Incident[];
  deliveries: Delivery[];
};

const WORKSPACE_KEY = 'statpulse.mockWorkspace.v1';
const SESSION_KEY = 'statpulse.mockSession.v1';
const DEFAULT_EMAIL = 'demo@statpulse.dev';

export async function login(email: string, password: string) {
  return authenticate(email, password);
}

export async function register(email: string, password: string) {
  return authenticate(email, password);
}

export async function fetchDashboardSnapshot(token: string, selectedMonitorId?: string): Promise<DashboardApiSnapshot> {
  await settleMockRequest();

  const workspace = readWorkspace();
  const selectedId = selectedMonitorId ?? workspace.monitors[0]?.id;

  return {
    user: workspace.user,
    monitors: workspace.monitors,
    selectedIncidents: selectedId
      ? workspace.incidents.filter((incident) => {
          const selectedMonitor = workspace.monitors.find((monitor) => monitor.id === selectedId);
          return incident.monitor === selectedMonitor?.name || incident.status === 'open';
        })
      : workspace.incidents,
    deliveries: workspace.deliveries,
  };
}

export async function createMonitor(_token: string, input: NewMonitorInput) {
  await settleMockRequest();

  const workspace = readWorkspace();
  const monitor = buildLocalMonitor(input);
  const nextWorkspace = {
    ...workspace,
    monitors: [monitor, ...workspace.monitors],
    deliveries: [
      {
        id: createId('del'),
        channel: 'Local workspace',
        event: `Monitor created: ${monitor.name}`,
        status: 'sent' as const,
        time: 'just now',
      },
      ...workspace.deliveries,
    ].slice(0, 12),
  };

  writeWorkspace(nextWorkspace);
  return monitor;
}

export async function updateMonitor(_token: string, id: string, input: Partial<NewMonitorInput> & { isActive?: boolean }) {
  await settleMockRequest();

  const workspace = readWorkspace();
  let updatedMonitor = workspace.monitors.find((monitor) => monitor.id === id);

  const nextMonitors = workspace.monitors.map((monitor) => {
    if (monitor.id !== id) {
      return monitor;
    }

    updatedMonitor = {
      ...monitor,
      ...input,
      name: input.name?.trim() || monitor.name,
      status: input.isActive === false ? 'UNKNOWN' : monitor.status,
      lastChecked: input.isActive === false ? 'paused' : monitor.lastChecked,
    };

    return updatedMonitor;
  });

  const nextWorkspace = {
    ...workspace,
    monitors: nextMonitors,
    deliveries: [
      {
        id: createId('del'),
        channel: 'Local workspace',
        event: `Monitor updated: ${updatedMonitor?.name ?? 'Monitor'}`,
        status: 'sent' as const,
        time: 'just now',
      },
      ...workspace.deliveries,
    ].slice(0, 12),
  };

  writeWorkspace(nextWorkspace);
  return updatedMonitor;
}

export async function deleteMonitor(_token: string, id: string) {
  await settleMockRequest();

  const workspace = readWorkspace();
  const deletedMonitor = workspace.monitors.find((monitor) => monitor.id === id);
  const nextWorkspace = {
    ...workspace,
    monitors: workspace.monitors.filter((monitor) => monitor.id !== id),
    incidents: workspace.incidents.filter((incident) => incident.monitor !== deletedMonitor?.name),
    deliveries: [
      {
        id: createId('del'),
        channel: 'Local workspace',
        event: `Monitor deleted: ${deletedMonitor?.name ?? 'Monitor'}`,
        status: 'skipped' as const,
        time: 'just now',
      },
      ...workspace.deliveries,
    ].slice(0, 12),
  };

  writeWorkspace(nextWorkspace);
}

async function authenticate(email: string, password: string): Promise<AuthSession> {
  await settleMockRequest();

  if (!email || !password) {
    throw new Error('Enter an email and password.');
  }

  const workspace = readWorkspace(email);
  const session = {
    user: workspace.user,
    token: `local-${workspace.user.id}`,
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function readWorkspace(email = DEFAULT_EMAIL): LocalWorkspace {
  const stored = window.localStorage.getItem(WORKSPACE_KEY);

  if (stored) {
    try {
      return JSON.parse(stored) as LocalWorkspace;
    } catch {
      window.localStorage.removeItem(WORKSPACE_KEY);
    }
  }

  const workspace = seedWorkspace(email);
  writeWorkspace(workspace);
  return workspace;
}

function writeWorkspace(workspace: LocalWorkspace) {
  window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
}

function seedWorkspace(email: string): LocalWorkspace {
  return {
    user: {
      id: 'user-local',
      email,
      createdAt: new Date().toISOString(),
    },
    monitors,
    incidents,
    deliveries,
  };
}

function buildLocalMonitor(input: NewMonitorInput): Monitor {
  const latency = Math.round(90 + Math.random() * 260);
  const status = getStatusForLatency(latency);

  return {
    id: createId('mon'),
    name: input.name?.trim() || getHostnameLabel(input.url),
    url: input.url,
    region: 'Local',
    method: input.method,
    status,
    uptime: status === 'DEGRADED' ? 99.21 : 99.96,
    latency,
    expectedStatus: input.expectedStatus,
    intervalSeconds: input.intervalSeconds,
    timeoutMs: input.timeoutMs,
    isActive: true,
    checks: buildChecks(latency),
    incidents: status === 'DOWN' ? 1 : 0,
    lastChecked: 'just now',
  };
}

function buildChecks(latency: number) {
  return [1.08, 0.94, 1.02, 0.98, 1.12, 1.04, 0.92, 1.06, 1.01, 0.96, 1.03, 1].map((scale) =>
    Math.round(latency * scale),
  );
}

function getStatusForLatency(latency: number): MonitorStatus {
  if (latency > 420) {
    return 'DEGRADED';
  }

  return 'UP';
}

function getHostnameLabel(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'HTTP monitor';
  }
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function settleMockRequest() {
  return new Promise((resolve) => window.setTimeout(resolve, 120));
}
