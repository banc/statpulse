'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AlertDeliveryPanel } from '../AlertDeliveryPanel';
import { AppHeader, type AppPage } from '../AppHeader';
import { CreateMonitorCard } from '../CreateMonitorCard';
import { DashboardShell } from '../DashboardShell';
import { IncidentsPanel } from '../IncidentsPanel';
import { MonitorDetail } from '../MonitorDetail';
import { MonitorList } from '../MonitorList';
import { OverviewPanel } from '../OverviewPanel';
import { ResponseChart } from '../ResponseChart';
import {
  createMonitor as createApiMonitor,
  deleteMonitor as deleteApiMonitor,
  fetchDashboardSnapshot,
  login,
  register,
  updateMonitor as updateApiMonitor,
} from '../../lib/api-client';
import { deliveries as demoDeliveries, incidents as demoIncidents, monitors as demoMonitors } from '../../lib/dashboard-data';
import type { Delivery, Incident, Monitor, NewMonitorInput } from '../../lib/dashboard-types';
import type { MonitorUpdateInput } from '../MonitorDetail/MonitorDetail';
import styles from '../DashboardView/DashboardView.module.css';

const AUTH_TOKEN_KEY = 'statpulse.authToken';
const POLLING_INTERVAL_MS = 30_000;

type DashboardWorkspaceProps = {
  activePage: AppPage;
  title: string;
  children: ReactNode;
};

type DashboardWorkspaceState = {
  activeIncidents: number;
  averageLatency: number;
  deliveries: Delivery[];
  healthyCount: number;
  incidents: Incident[];
  isCreating: boolean;
  isSavingMonitor: boolean;
  createError?: string;
  detailError?: string;
  monitors: Monitor[];
  selectedMonitor?: Monitor;
  selectedMonitorId: string;
  userEmail?: string;
  createMonitor: (input: NewMonitorInput) => Promise<void>;
  deleteMonitor: (id: string) => Promise<void>;
  openCreateMonitor: () => void;
  refreshDashboard: (authToken?: string | null, monitorId?: string) => Promise<void>;
  selectMonitor: (id: string) => void;
  updateMonitor: (id: string, input: MonitorUpdateInput) => Promise<void>;
};

const DashboardWorkspaceContext = createContext<DashboardWorkspaceState | null>(null);

export function DashboardWorkspace({ activePage, title, children }: DashboardWorkspaceProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedMonitorId, setSelectedMonitorId] = useState('');
  const [createError, setCreateError] = useState<string>();
  const [detailError, setDetailError] = useState<string>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingMonitor, setIsSavingMonitor] = useState(false);
  const hasHydratedSession = useRef(false);

  const refreshDashboard = useCallback(
    async (authToken = token, monitorId = selectedMonitorId) => {
      if (!authToken) {
        return;
      }

      const snapshot = await fetchDashboardSnapshot(authToken, monitorId);
      setToken(authToken);
      setUserEmail(snapshot.user.email);
      setMonitors(snapshot.monitors);
      setIncidents(snapshot.selectedIncidents);
      setDeliveries(snapshot.deliveries);

      if (snapshot.monitors.length > 0 && !snapshot.monitors.some((monitor) => monitor.id === monitorId)) {
        setSelectedMonitorId(snapshot.monitors[0].id);
      }
    },
    [selectedMonitorId, token],
  );

  useEffect(() => {
    if (hasHydratedSession.current) {
      return;
    }

    hasHydratedSession.current = true;
    const storedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
    const localToken = storedToken ?? 'local-user-local';
    window.localStorage.setItem(AUTH_TOKEN_KEY, localToken);

    const timeoutId = window.setTimeout(() => {
      void refreshDashboard(localToken);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshDashboard]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshDashboard(token, selectedMonitorId);
    }, POLLING_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [refreshDashboard, selectedMonitorId, token]);

  useEffect(() => {
    if (!isCreateModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsCreateModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCreateModalOpen]);

  const displayedMonitors = monitors.length > 0 ? monitors : demoMonitors;
  const displayedIncidents = incidents.length > 0 ? incidents : demoIncidents;
  const displayedDeliveries = deliveries.length > 0 ? deliveries : demoDeliveries;
  const effectiveSelectedMonitorId = displayedMonitors.some((monitor) => monitor.id === selectedMonitorId)
    ? selectedMonitorId
    : displayedMonitors[0]?.id;
  const selectedMonitor = useMemo(
    () => displayedMonitors.find((monitor) => monitor.id === effectiveSelectedMonitorId) ?? displayedMonitors[0],
    [displayedMonitors, effectiveSelectedMonitorId],
  );

  const healthyCount = displayedMonitors.filter((monitor) => monitor.status === 'UP').length;
  const activeIncidents = displayedIncidents.filter((incident) => incident.status === 'open').length;
  const averageLatency = Math.round(
    displayedMonitors.reduce((total, monitor) => total + monitor.latency, 0) / Math.max(displayedMonitors.length, 1),
  );

  async function handleLogin(email: string, password: string) {
    const session = await login(email, password);
    window.localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    await refreshDashboard(session.token);
  }

  async function handleRegister(email: string, password: string) {
    const session = await register(email, password);
    window.localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    await refreshDashboard(session.token);
  }

  async function handleCreateMonitor(input: NewMonitorInput) {
    const authToken = token ?? 'local-user-local';
    setCreateError(undefined);
    setIsCreating(true);

    try {
      const monitor = await createApiMonitor(authToken, input);
      setSelectedMonitorId(monitor.id);
      await refreshDashboard(authToken, monitor.id);
      setIsCreateModalOpen(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Unable to create monitor.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateMonitor(id: string, input: MonitorUpdateInput) {
    const authToken = token ?? 'local-user-local';
    setDetailError(undefined);
    setIsSavingMonitor(true);

    try {
      await updateApiMonitor(authToken, id, input);
      await refreshDashboard(authToken, id);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Unable to update monitor.');
    } finally {
      setIsSavingMonitor(false);
    }
  }

  async function handleDeleteMonitor(id: string) {
    const authToken = token ?? 'local-user-local';
    setDetailError(undefined);
    setIsSavingMonitor(true);

    try {
      await deleteApiMonitor(authToken, id);
      const nextSelectedId = displayedMonitors.find((monitor) => monitor.id !== id)?.id ?? '';
      setSelectedMonitorId(nextSelectedId);
      await refreshDashboard(authToken, nextSelectedId);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Unable to delete monitor.');
    } finally {
      setIsSavingMonitor(false);
    }
  }

  function handleSelectMonitor(id: string) {
    setSelectedMonitorId(id);
    void refreshDashboard(token ?? 'local-user-local', id);
  }

  const workspace: DashboardWorkspaceState = {
    activeIncidents,
    averageLatency,
    createError,
    deliveries: displayedDeliveries,
    detailError,
    healthyCount,
    incidents: displayedIncidents,
    isCreating,
    isSavingMonitor,
    monitors: displayedMonitors,
    selectedMonitor,
    selectedMonitorId: effectiveSelectedMonitorId ?? '',
    userEmail,
    createMonitor: handleCreateMonitor,
    deleteMonitor: handleDeleteMonitor,
    openCreateMonitor: () => setIsCreateModalOpen(true),
    refreshDashboard,
    selectMonitor: handleSelectMonitor,
    updateMonitor: handleUpdateMonitor,
  };

  return (
    <DashboardWorkspaceContext.Provider value={workspace}>
      <DashboardShell>
        <AppHeader
          activePage={activePage}
          userEmail={userEmail}
          isAuthenticating={false}
          onNavigate={(page) => router.push(getPagePath(page))}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onLogout={() => undefined}
        />

        <main className={styles.board}>
          <div className={styles.topbar}>
            <div>
              <p className={styles.eyebrow}>StatPulse</p>
              <h1 className={styles.pageTitle}>{title}</h1>
            </div>
            <div className={styles.topActions}>
              <button className={styles.newMonitorButton} type="button" onClick={() => setIsCreateModalOpen(true)}>
                New monitor
              </button>
              <div className={styles.account}>{userEmail ?? 'Local workspace'}</div>
            </div>
          </div>

          <div className={styles.scrollArea}>{children}</div>

          {isCreateModalOpen && typeof document !== 'undefined'
            ? createPortal(
                <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setIsCreateModalOpen(false)}>
                  <div
                    aria-modal="true"
                    className={styles.modalPanel}
                    role="dialog"
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <button
                      className={styles.modalClose}
                      type="button"
                      aria-label="Close"
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      x
                    </button>
                    <CreateMonitorCard isSubmitting={isCreating} errorMessage={createError} onCreate={handleCreateMonitor} />
                  </div>
                </div>,
                document.body,
              )
            : null}
        </main>
      </DashboardShell>
    </DashboardWorkspaceContext.Provider>
  );
}

export function DashboardPageContent() {
  const workspace = useDashboardWorkspace();

  return (
    <>
      <section className={styles.overviewGrid}>
        <OverviewPanel
          healthyCount={workspace.healthyCount}
          totalCount={workspace.monitors.length}
          averageLatency={workspace.averageLatency}
          activeIncidents={workspace.activeIncidents}
        />
      </section>

      <section className={styles.workspaceGrid}>
        <div className={styles.monitorColumn}>
          <MonitorList
            monitors={workspace.monitors}
            selectedMonitorId={workspace.selectedMonitorId}
            onAdd={workspace.openCreateMonitor}
            onSelect={workspace.selectMonitor}
          />
        </div>
        <div className={styles.detailColumn}>
          <MonitorDetail
            monitor={workspace.selectedMonitor}
            isSaving={workspace.isSavingMonitor}
            errorMessage={workspace.detailError}
            onUpdate={workspace.updateMonitor}
            onDelete={workspace.deleteMonitor}
          />
        </div>
        <aside className={styles.sideRail}>
          <IncidentsPanel incidents={workspace.incidents} />
          <AlertDeliveryPanel deliveries={workspace.deliveries} />
        </aside>
      </section>
    </>
  );
}

export function MonitorsPageContent() {
  const workspace = useDashboardWorkspace();

  return (
    <section className={styles.monitorsPage}>
      <div className={styles.monitorColumn}>
        <MonitorList
          monitors={workspace.monitors}
          selectedMonitorId={workspace.selectedMonitorId}
          onAdd={workspace.openCreateMonitor}
          onSelect={workspace.selectMonitor}
        />
      </div>
      <div className={styles.detailColumn}>
        <MonitorDetail
          monitor={workspace.selectedMonitor}
          isSaving={workspace.isSavingMonitor}
          errorMessage={workspace.detailError}
          onUpdate={workspace.updateMonitor}
          onDelete={workspace.deleteMonitor}
        />
      </div>
    </section>
  );
}

export function IncidentsPageContent() {
  const workspace = useDashboardWorkspace();

  return (
    <section className={styles.focusPage}>
      <div className={styles.metricGrid}>
        <StatCard label="Open incidents" value={String(workspace.activeIncidents)} detail="Require investigation" />
        <StatCard
          label="Resolved"
          value={String(workspace.incidents.length - workspace.activeIncidents)}
          detail="Recently recovered"
        />
        <StatCard label="Monitors affected" value={String(workspace.monitors.length)} detail="Current workspace" />
      </div>
      <IncidentsPanel incidents={workspace.incidents} />
    </section>
  );
}

export function AlertsPageContent() {
  const workspace = useDashboardWorkspace();

  return (
    <section className={styles.focusPage}>
      <div className={styles.channelGrid}>
        <article className={styles.channelCard}>
          <p className={styles.channelType}>Telegram</p>
          <h2>On-call channel</h2>
          <span>Active</span>
        </article>
        <article className={styles.channelCard}>
          <p className={styles.channelType}>Email</p>
          <h2>Ops inbox</h2>
          <span>Cooldown 5m</span>
        </article>
      </div>
      <AlertDeliveryPanel deliveries={workspace.deliveries} />
    </section>
  );
}

export function GraphPageContent() {
  const workspace = useDashboardWorkspace();

  return (
    <section className={styles.graphPage}>
      <div className={styles.monitorColumn}>
        <MonitorList
          monitors={workspace.monitors}
          selectedMonitorId={workspace.selectedMonitorId}
          onAdd={workspace.openCreateMonitor}
          onSelect={workspace.selectMonitor}
        />
      </div>
      <div className={styles.graphColumn}>
        {workspace.selectedMonitor ? (
          <ResponseChart monitorId={workspace.selectedMonitor.id} checks={workspace.selectedMonitor.checks} />
        ) : null}
        <div className={styles.metricGrid}>
          <StatCard label="Average latency" value={`${workspace.averageLatency}ms`} detail="Across active monitors" />
          <StatCard
            label="Healthy monitors"
            value={`${workspace.healthyCount}/${workspace.monitors.length}`}
            detail="Currently up"
          />
          <StatCard label="Alert deliveries" value={String(workspace.deliveries.length)} detail="Recent delivery log" />
        </div>
      </div>
    </section>
  );
}

function useDashboardWorkspace() {
  const workspace = useContext(DashboardWorkspaceContext);

  if (!workspace) {
    throw new Error('Dashboard page content must be rendered inside DashboardWorkspace.');
  }

  return workspace;
}

function getPagePath(page: AppPage) {
  const paths: Record<AppPage, string> = {
    dashboard: '/dashboard',
    monitors: '/monitors',
    incidents: '/incidents',
    alerts: '/alerts',
    graph: '/graph',
  };

  return paths[page];
}

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <article className={styles.statCard}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}
