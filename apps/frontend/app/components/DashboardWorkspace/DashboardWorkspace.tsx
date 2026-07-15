'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type UIEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AlertDeliveryPanel } from '../AlertDeliveryPanel';
import { AppHeader, type AppPage } from '../AppHeader';
import { AuthCard } from '../AuthCard';
import { CreateMonitorCard } from '../CreateMonitorCard';
import { DashboardShell } from '../DashboardShell';
import { MonitorDetail } from '../MonitorDetail';
import { MonitorList } from '../MonitorList';
import { OverviewPanel } from '../OverviewPanel';
import { IconButton } from '../ui';
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
import {
  getIncidentsForPeriod,
  mockIncidents,
  performanceDataByPeriod,
  periodOptions,
  serviceLatencies,
  type OpsIncident,
  type OpsIncidentStatus,
  type TimePeriod,
} from '../../lib/ops-mock-data';
import type { MonitorUpdateInput } from '../MonitorDetail/MonitorDetail';
import { cx } from '../../lib/class-name';
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
  selectedPeriod: TimePeriod;
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
  setSelectedPeriod: (period: TimePeriod) => void;
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
  const [authError, setAuthError] = useState<string>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingMonitor, setIsSavingMonitor] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('24h');
  const hasHydratedSession = useRef(false);
  const lastScrollTop = useRef(0);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const [isTopbarCompact, setIsTopbarCompact] = useState(false);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const scrollElement = event.currentTarget;
    const nextScrollTop = scrollElement.scrollTop;
    const scrollDelta = nextScrollTop - lastScrollTop.current;

    if (Math.abs(scrollDelta) < 4) {
      lastScrollTop.current = nextScrollTop;
      return;
    }

    const maxScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight;
    const isNearBottom = nextScrollTop >= maxScrollTop - 8;
    const isNearTop = nextScrollTop <= 8;

    if (isNearTop) {
      setIsTopbarCompact(false);
    } else if (scrollDelta > 0) {
      setIsTopbarCompact(true);
    } else if (!isNearBottom) {
      setIsTopbarCompact(false);
    }

    lastScrollTop.current = nextScrollTop;
  }, []);

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
    if (!isCreateModalOpen && !isAuthModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsCreateModalOpen(false);
        setIsAuthModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen, isCreateModalOpen]);

  useEffect(() => {
    if (!isNotificationsOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node) || notificationMenuRef.current?.contains(target)) {
        return;
      }

      setIsNotificationsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNotificationsOpen]);

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
  const notificationItems = [
    ...displayedIncidents.slice(0, 3).map((incident) => ({
      id: incident.id,
      title: incident.title,
      detail: `${incident.monitor} / ${incident.duration}`,
      time: incident.startedAt,
      tone: incident.status === 'open' ? 'danger' : 'success',
    })),
    ...displayedDeliveries.slice(0, 4).map((delivery) => ({
      id: delivery.id,
      title: delivery.event,
      detail: delivery.channel,
      time: delivery.time,
      tone: delivery.status === 'failed' ? 'danger' : delivery.status === 'skipped' ? 'warning' : 'success',
    })),
  ];
  const unreadNotifications = notificationItems.filter((item) => item.tone === 'danger' || item.tone === 'warning').length;
  const averageLatency = Math.round(
    displayedMonitors.reduce((total, monitor) => total + monitor.latency, 0) / Math.max(displayedMonitors.length, 1),
  );

  async function handleLogin(email: string, password: string) {
    setAuthError(undefined);
    setIsAuthenticating(true);

    try {
      const session = await login(email, password);
      window.localStorage.setItem(AUTH_TOKEN_KEY, session.token);
      await refreshDashboard(session.token);
      setIsAuthModalOpen(false);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to login.');
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function handleRegister(email: string, password: string) {
    setAuthError(undefined);
    setIsAuthenticating(true);

    try {
      const session = await register(email, password);
      window.localStorage.setItem(AUTH_TOKEN_KEY, session.token);
      await refreshDashboard(session.token);
      setIsAuthModalOpen(false);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to create account.');
    } finally {
      setIsAuthenticating(false);
    }
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
    selectedPeriod,
    selectedMonitor,
    selectedMonitorId: effectiveSelectedMonitorId ?? '',
    userEmail,
    createMonitor: handleCreateMonitor,
    deleteMonitor: handleDeleteMonitor,
    openCreateMonitor: () => setIsCreateModalOpen(true),
    refreshDashboard,
    selectMonitor: handleSelectMonitor,
    setSelectedPeriod,
    updateMonitor: handleUpdateMonitor,
  };

  return (
    <DashboardWorkspaceContext.Provider value={workspace}>
      <DashboardShell>
        <AppHeader
          activePage={activePage}
          alertCount={displayedDeliveries.length}
          incidentCount={activeIncidents}
          userEmail={userEmail}
          onNavigate={(page) => router.push(getPagePath(page))}
        />

        <main className={styles.board}>
          <div className={cx(styles.topbar, isTopbarCompact && styles.topbarCompact)}>
            <div>
              <h1 className={styles.pageTitle}>{activePage === 'dashboard' ? 'System Overview' : title}</h1>
              <p className={styles.eyebrow}>Real-time Engineering Metrics</p>
            </div>
            <div className={styles.topbarActions}>
              <div className={styles.periodSelector} aria-label="Select reporting period">
                <CalendarIcon />
                {periodOptions.map((option) => (
                  <button
                    key={option.id}
                    className={cx(styles.periodOption, selectedPeriod === option.id && styles.periodOptionActive)}
                    type="button"
                    onClick={() => setSelectedPeriod(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className={styles.notificationMenu} ref={notificationMenuRef}>
                <IconButton
                  className={styles.notificationButton}
                  type="button"
                  aria-label="Notifications"
                  aria-expanded={isNotificationsOpen}
                  onClick={() => setIsNotificationsOpen((value) => !value)}
                >
                  <BellIcon />
                </IconButton>
                {isNotificationsOpen ? (
                  <div className={styles.notificationPopover} role="menu">
                    <div className={styles.notificationHeader}>
                      <div>
                        <h2>Notifications</h2>
                        <p>{unreadNotifications} need attention</p>
                      </div>
                      <span>{notificationItems.length}</span>
                    </div>
                    <div className={styles.notificationList}>
                      {notificationItems.map((item) => (
                        <button
                          key={item.id}
                          className={styles.notificationItem}
                          type="button"
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            router.push(item.tone === 'danger' ? '/incidents' : '/alerts');
                          }}
                        >
                          <span className={cx(styles.notificationDot, styles[`notificationDot${capitalize(item.tone)}`])} />
                          <span>
                            <strong>{item.title}</strong>
                            <small>{item.detail}</small>
                          </span>
                          <time>{item.time}</time>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className={styles.scrollArea} onScroll={handleScroll}>
            {children}
          </div>

          {isCreateModalOpen && typeof document !== 'undefined'
            ? createPortal(
                <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setIsCreateModalOpen(false)}>
                  <div
                    aria-modal="true"
                    className={styles.modalPanel}
                    role="dialog"
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <IconButton
                      className={styles.modalClose}
                      type="button"
                      aria-label="Close"
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      <CloseIcon />
                    </IconButton>
                    <CreateMonitorCard isSubmitting={isCreating} errorMessage={createError} onCreate={handleCreateMonitor} />
                  </div>
                </div>,
                document.body,
              )
            : null}

          {isAuthModalOpen && typeof document !== 'undefined'
            ? createPortal(
                <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setIsAuthModalOpen(false)}>
                  <div
                    aria-modal="true"
                    className={styles.modalPanel}
                    role="dialog"
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <IconButton
                      className={styles.modalClose}
                      type="button"
                      aria-label="Close"
                      onClick={() => setIsAuthModalOpen(false)}
                    >
                      <CloseIcon />
                    </IconButton>
                    <AuthCard
                      isSubmitting={isAuthenticating}
                      errorMessage={authError}
                      onLogin={handleLogin}
                      onRegister={handleRegister}
                    />
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

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 4a6 6 0 0 0-6 6v4l-2 3h16l-2-3v-4a6 6 0 0 0-6-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function DashboardPageContent() {
  const workspace = useDashboardWorkspace();
  const toggleMonitorActive = (monitor: Monitor) => {
    void workspace.updateMonitor(monitor.id, {
      name: monitor.name,
      url: monitor.url,
      method: monitor.method as MonitorUpdateInput['method'],
      expectedStatus: monitor.expectedStatus,
      intervalSeconds: monitor.intervalSeconds ?? 60,
      timeoutMs: monitor.timeoutMs ?? 10000,
      isActive: !(monitor.isActive ?? true),
    });
  };

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
            onToggleActive={toggleMonitorActive}
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
    </>
  );
}

export function MonitorsPageContent() {
  const workspace = useDashboardWorkspace();
  const toggleMonitorActive = (monitor: Monitor) => {
    void workspace.updateMonitor(monitor.id, {
      name: monitor.name,
      url: monitor.url,
      method: monitor.method as MonitorUpdateInput['method'],
      expectedStatus: monitor.expectedStatus,
      intervalSeconds: monitor.intervalSeconds ?? 60,
      timeoutMs: monitor.timeoutMs ?? 10000,
      isActive: !(monitor.isActive ?? true),
    });
  };

  return (
    <section className={styles.monitorsPage}>
      <div className={styles.monitorColumn}>
        <MonitorList
          monitors={workspace.monitors}
          selectedMonitorId={workspace.selectedMonitorId}
          onAdd={workspace.openCreateMonitor}
          onSelect={workspace.selectMonitor}
          onToggleActive={toggleMonitorActive}
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
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OpsIncidentStatus | 'All'>('All');
  const [selectedIncidentId, setSelectedIncidentId] = useState(mockIncidents[0].id);
  const incidentsForPeriod = useMemo(() => getIncidentsForPeriod(workspace.selectedPeriod), [workspace.selectedPeriod]);
  const filteredIncidents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return incidentsForPeriod.filter((incident) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        incident.reason.toLowerCase().includes(normalizedQuery) ||
        incident.id.toLowerCase().includes(normalizedQuery) ||
        incident.monitorId.toLowerCase().includes(normalizedQuery) ||
        incident.monitorName.toLowerCase().includes(normalizedQuery) ||
        incident.reason.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === 'All' || incident.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [incidentsForPeriod, query, statusFilter]);
  const selectedIncident =
    filteredIncidents.find((incident) => incident.id === selectedIncidentId) ?? filteredIncidents[0] ?? incidentsForPeriod[0];
  const statusTabs: Array<OpsIncidentStatus | 'All'> = ['All', 'Open', 'Resolved'];

  return (
    <section className={styles.incidentsConsole}>
      <div className={styles.incidentsListPane}>
        <div className={styles.incidentSearchRow}>
          <label className={styles.incidentSearch}>
            <SearchIcon />
            <input
              aria-label="Search incidents"
              placeholder="Search incidents..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button className={styles.filterButton} type="button" aria-label="Filter incidents">
            <FilterIcon />
          </button>
        </div>

        <div className={styles.incidentTabs} aria-label="Incident status filter">
          {statusTabs.map((status) => (
            <button
              key={status}
              className={cx(styles.incidentTab, statusFilter === status && styles.incidentTabActive)}
              type="button"
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className={styles.incidentList}>
          {filteredIncidents.slice(0, 24).map((incident) => (
            <IncidentListCard
              key={incident.id}
              incident={incident}
              isSelected={incident.id === selectedIncident?.id}
              onSelect={() => setSelectedIncidentId(incident.id)}
            />
          ))}
        </div>
      </div>

      {selectedIncident ? <IncidentInspector incident={selectedIncident} /> : null}
    </section>
  );
}

export function AlertsPageContent() {
  const workspace = useDashboardWorkspace();
  const sentCount = workspace.deliveries.filter((delivery) => delivery.status === 'sent').length;
  const skippedCount = workspace.deliveries.filter((delivery) => delivery.status === 'skipped').length;
  const failedCount = workspace.deliveries.filter((delivery) => delivery.status === 'failed').length;
  const successRate = Math.round((sentCount / Math.max(workspace.deliveries.length, 1)) * 100);

  return (
    <section className={styles.alertsPage}>
      <div className={styles.alertKpiGrid}>
        <AlertKpi label="Delivery success" value={`${successRate}%`} detail={`${sentCount} sent notifications`} tone="success" />
        <AlertKpi label="Cooldown skips" value={String(skippedCount)} detail="Noise suppression active" tone="warning" />
        <AlertKpi label="Failed attempts" value={String(failedCount)} detail="Provider errors to review" tone={failedCount > 0 ? 'danger' : 'success'} />
        <AlertKpi label="Active incidents" value={String(workspace.activeIncidents)} detail="Eligible for routing" tone="neutral" />
      </div>

      <div className={styles.alertsGrid}>
        <div className={styles.alertsPrimaryColumn}>
          <div className={styles.channelGrid}>
            <AlertChannelCard
              type="Telegram"
              name="On-call channel"
              status="Enabled"
              target="@statpulse-oncall"
              cooldown="5 min cooldown"
              lastDelivery={workspace.deliveries.find((delivery) => delivery.channel.includes('Telegram'))?.time ?? 'No deliveries'}
            />
            <AlertChannelCard
              type="Email"
              name="Ops inbox"
              status="Enabled"
              target="ops@statpulse.dev"
              cooldown="10 min digest window"
              lastDelivery={workspace.deliveries.find((delivery) => delivery.channel.includes('Email'))?.time ?? 'No deliveries'}
            />
          </div>
          <AlertDeliveryPanel deliveries={workspace.deliveries} />
        </div>

        <aside className={styles.alertsSidePanel}>
          <section className={styles.routingPanel}>
            <div className={styles.chartHeader}>
              <div>
                <h2>Routing policy</h2>
                <p>How incident notifications are selected.</p>
              </div>
            </div>
            <div className={styles.routingSteps}>
              <RoutingStep index="1" title="Incident opened" detail="Monitor transitions to DOWN or DEGRADED." />
              <RoutingStep index="2" title="Cooldown check" detail="Suppress repeated notifications for the same monitor." />
              <RoutingStep index="3" title="Channel fan-out" detail="Send to Telegram first, email as secondary trail." />
              <RoutingStep index="4" title="Resolution update" detail="Notify when resolvedAt is populated." />
            </div>
          </section>

          <section className={styles.routingPanel}>
            <div className={styles.chartHeader}>
              <div>
                <h2>Channel health</h2>
                <p>Recent delivery state by provider.</p>
              </div>
            </div>
            <div className={styles.channelHealthList}>
              <ChannelHealth name="Telegram" sent={2} failed={0} latency="1.2s" />
              <ChannelHealth name="Email" sent={1} failed={1} latency="3.8s" />
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

export function GraphPageContent() {
  const workspace = useDashboardWorkspace();
  const performanceData = performanceDataByPeriod[workspace.selectedPeriod];
  const p50 = performanceData.p50.at(-1) ?? 0;
  const p95 = performanceData.p95.at(-1) ?? 0;
  const throughput = performanceData.throughput.at(-1) ?? 0;

  return (
    <section className={styles.performancePage}>
      <div className={styles.performanceKpiGrid}>
        <PerformanceKpi label="P50 Latency" value={`${p50}ms`} delta="-8ms" tone="success" />
        <PerformanceKpi label="P95 Latency" value={`${p95}ms`} delta="+12ms" tone="danger" />
        <PerformanceKpi label="Throughput" value={`${(throughput / 1000).toFixed(1)}k`} delta="+2.3k" tone="success" />
        <PerformanceKpi label="Error Rate" value={`${performanceData.errorRate.toFixed(2)}%`} delta="-0.08%" tone="success" />
      </div>

      <div className={styles.performanceCharts}>
        <article className={styles.chartPanel}>
          <div className={styles.chartHeader}>
            <div>
              <h2>Latency Distribution</h2>
              <p>P50, P95, P99 over time (ms)</p>
            </div>
            <ChartLegend
              items={[
                { label: 'P50', color: '#2eaa72' },
                { label: 'P95', color: '#0070d9' },
                { label: 'P99', color: '#e85fad' },
              ]}
            />
          </div>
          <LineChart
            labels={performanceData.labels}
            series={[
              { label: 'P50', values: performanceData.p50, color: '#2eaa72' },
              { label: 'P95', values: performanceData.p95, color: '#0070d9' },
              { label: 'P99', values: performanceData.p99, color: '#e85fad' },
            ]}
            valueSuffix="ms"
          />
        </article>

        <article className={styles.chartPanel}>
          <div className={styles.chartHeader}>
            <div>
              <h2>Request Throughput</h2>
              <p>Requests per second</p>
            </div>
          </div>
          <LineChart
            labels={performanceData.labels}
            series={[{ label: 'Requests', values: performanceData.throughput, color: '#0070d9' }]}
            valueFormatter={(value) => value.toLocaleString('en')}
          />
        </article>
      </div>

      <article className={styles.serviceLatencyPanel}>
        <div className={styles.chartHeader}>
          <div>
            <h2>Service Latencies</h2>
            <p>Current latency percentiles by service</p>
          </div>
        </div>
        <div className={styles.serviceTableWrap}>
          <table className={styles.serviceTable}>
            <thead>
              <tr>
                <th>Service</th>
                <th>P50</th>
                <th>P95</th>
                <th>P99</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {serviceLatencies.map((service) => (
                <tr key={service.service}>
                  <td>{service.service}</td>
                  <td>{service.p50}ms</td>
                  <td>{service.p95}ms</td>
                  <td>{service.p99}ms</td>
                  <td>
                    <span className={cx(styles.serviceStatus, styles[`serviceStatus${capitalize(service.status)}`])}>
                      {service.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

type IncidentListCardProps = {
  incident: OpsIncident;
  isSelected: boolean;
  onSelect: () => void;
};

function IncidentListCard({ incident, isSelected, onSelect }: IncidentListCardProps) {
  return (
    <button
      className={cx(styles.incidentCard, isSelected && styles.incidentCardSelected)}
      type="button"
      onClick={onSelect}
    >
      <span className={styles.incidentCardTop}>
        <StatusBadge status={incident.status} />
        <span>{incident.id}</span>
      </span>
      <strong>{incident.reason}</strong>
      <span className={styles.incidentMonitor}>{incident.monitorName}</span>
      <span className={styles.incidentCardBottom}>
        <span className={styles.incidentModelField}>{incident.monitorId}</span>
        <span className={styles.incidentAge}>
          <ClockIcon />
          {formatRelativeDate(incident.startedAt)}
        </span>
      </span>
    </button>
  );
}

function IncidentInspector({ incident }: { incident: OpsIncident }) {
  return (
    <aside className={styles.incidentInspector}>
      <div className={styles.inspectorHeader}>
        <StatusBadge status={incident.status} />
      </div>

      <h2>{incident.reason}</h2>
      <p className={styles.inspectorId}>
        {incident.id} / {incident.monitorId}
      </p>

      <div className={styles.inspectorMetricGrid}>
        <div>
          <span>Monitor</span>
          <strong>{incident.monitorName}</strong>
        </div>
        <div>
          <span>Started At</span>
          <strong>{formatDateTime(incident.startedAt)}</strong>
        </div>
        <div>
          <span>Resolved At</span>
          <strong>{incident.resolvedAt ? formatDateTime(incident.resolvedAt) : 'Open'}</strong>
        </div>
      </div>

      <div className={styles.inspectorSection}>
        <h3>Reason</h3>
        <p>{incident.reason}</p>
      </div>

      <div className={styles.inspectorSection}>
        <h3>Model Fields</h3>
        <div className={styles.modelFieldGrid}>
          <span>
            <small>createdAt</small>
            <strong>{formatDateTime(incident.createdAt)}</strong>
          </span>
          <span>
            <small>updatedAt</small>
            <strong>{formatDateTime(incident.updatedAt)}</strong>
          </span>
        </div>
      </div>

      <div className={styles.inspectorSection}>
        <h3>Timeline</h3>
        <div className={styles.timeline}>
          {incident.timeline.map((event) => (
            <div key={`${incident.id}-${event.label}`} className={styles.timelineItem}>
              <span className={cx(styles.timelineDot, styles[`timelineDot${capitalize(event.tone)}`])} />
              <span>
                <strong>{event.label}</strong>
                <small>{event.time}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

type AlertKpiProps = {
  label: string;
  value: string;
  detail: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
};

function AlertKpi({ label, value, detail, tone }: AlertKpiProps) {
  return (
    <article className={styles.alertKpi}>
      <span className={cx(styles.alertKpiDot, styles[`alertKpiDot${capitalize(tone)}`])} />
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

type AlertChannelCardProps = {
  type: string;
  name: string;
  status: string;
  target: string;
  cooldown: string;
  lastDelivery: string;
};

function AlertChannelCard({ type, name, status, target, cooldown, lastDelivery }: AlertChannelCardProps) {
  return (
    <article className={styles.alertChannelCard}>
      <div className={styles.alertChannelHeader}>
        <div>
          <p>{type}</p>
          <h2>{name}</h2>
        </div>
        <span>{status}</span>
      </div>
      <div className={styles.alertChannelMeta}>
        <span>
          <small>Target</small>
          <strong>{target}</strong>
        </span>
        <span>
          <small>Policy</small>
          <strong>{cooldown}</strong>
        </span>
        <span>
          <small>Last delivery</small>
          <strong>{lastDelivery}</strong>
        </span>
      </div>
    </article>
  );
}

function RoutingStep({ index, title, detail }: { index: string; title: string; detail: string }) {
  return (
    <div className={styles.routingStep}>
      <span>{index}</span>
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}

function ChannelHealth({ name, sent, failed, latency }: { name: string; sent: number; failed: number; latency: string }) {
  return (
    <div className={styles.channelHealthItem}>
      <div>
        <strong>{name}</strong>
        <p>{sent} sent / {failed} failed</p>
      </div>
      <span>{latency}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: OpsIncidentStatus }) {
  return <span className={cx(styles.statusBadge, styles[`status${status}`])}>{status}</span>;
}

type PerformanceKpiProps = {
  label: string;
  value: string;
  delta: string;
  tone: 'success' | 'danger';
};

function PerformanceKpi({ label, value, delta, tone }: PerformanceKpiProps) {
  return (
    <article className={styles.performanceKpi}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small className={tone === 'success' ? styles.deltaSuccess : styles.deltaDanger}>{delta}</small>
    </article>
  );
}

function ChartLegend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className={styles.chartLegend}>
      {items.map((item) => (
        <span key={item.label}>
          <i style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

type LineChartProps = {
  labels: string[];
  series: Array<{ label: string; values: number[]; color: string }>;
  valueFormatter?: (value: number) => string;
  valueSuffix?: string;
};

function LineChart({ labels, series, valueFormatter, valueSuffix = '' }: LineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const allValues = series.flatMap((item) => item.values);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(...allValues);
  const width = 560;
  const height = 260;
  const padding = 36;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const activeIndex = hoverIndex ?? null;
  const tooltipWidth = series.length > 1 ? 136 : 126;
  const tooltipHeight = 34 + series.length * 18;

  function getPoint(value: number, index: number, values: number[]) {
    const { x, y } = getPointPosition(value, index, values);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }

  function getPointPosition(value: number, index: number, values: number[]) {
    const x = padding + (index / Math.max(values.length - 1, 1)) * chartWidth;
    const y = padding + (1 - (value - minValue) / Math.max(maxValue - minValue, 1)) * chartHeight;
    return { x, y };
  }

  function formatTooltipValue(value: number) {
    const formatted = valueFormatter ? valueFormatter(value) : String(value);
    return valueSuffix ? `${formatted}${valueSuffix}` : formatted;
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * width;
    const ratio = (pointerX - padding) / chartWidth;
    const nextIndex = Math.min(labels.length - 1, Math.max(0, Math.round(ratio * (labels.length - 1))));
    setHoverIndex(nextIndex);
  }

  return (
    <svg
      className={styles.lineChart}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Performance line chart"
      onPointerLeave={() => setHoverIndex(null)}
      onPointerMove={handlePointerMove}
    >
      {gridLines.map((line) => {
        const y = padding + line * chartHeight;
        return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} className={styles.chartGridLine} />;
      })}
      {labels.map((label, index) => {
        const x = padding + (index / Math.max(labels.length - 1, 1)) * chartWidth;
        return (
          <text key={label} x={x} y={height - 8} textAnchor="middle" className={styles.chartLabel}>
            {label}
          </text>
        );
      })}
      {series.map((item) => (
        <polyline
          key={item.color}
          fill="none"
          points={item.values.map((value, index) => getPoint(value, index, item.values)).join(' ')}
          stroke={item.color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      ))}
      {activeIndex !== null ? (
        <g className={styles.chartTooltipLayer}>
          {(() => {
            const guideX = padding + (activeIndex / Math.max(labels.length - 1, 1)) * chartWidth;
            const tooltipX = Math.min(width - padding - tooltipWidth, Math.max(padding, guideX + 12));
            const tooltipY = padding;

            return (
              <>
                <line x1={guideX} x2={guideX} y1={padding} y2={height - padding} className={styles.chartGuideLine} />
                {series.map((item) => {
                  const value = item.values[activeIndex] ?? 0;
                  const point = getPointPosition(value, activeIndex, item.values);
                  return <circle key={item.label} cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke={item.color} strokeWidth="3" />;
                })}
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="8"
                  className={styles.chartTooltipBox}
                />
                <text x={tooltipX + 12} y={tooltipY + 20} className={styles.chartTooltipTitle}>
                  {labels[activeIndex]}
                </text>
                {series.map((item, index) => (
                  <g key={item.label}>
                    <circle cx={tooltipX + 14} cy={tooltipY + 40 + index * 18} r="4" fill={item.color} />
                    <text x={tooltipX + 24} y={tooltipY + 44 + index * 18} className={styles.chartTooltipText}>
                      {item.label}: {formatTooltipValue(item.values[activeIndex] ?? 0)}
                    </text>
                  </g>
                ))}
              </>
            );
          })()}
        </g>
      ) : null}
    </svg>
  );
}

function useDashboardWorkspace() {
  const workspace = useContext(DashboardWorkspaceContext);

  if (!workspace) {
    throw new Error('Dashboard page content must be rendered inside DashboardWorkspace.');
  }

  return workspace;
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 5h16l-6 7v5l-4 2v-7Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}

function formatRelativeDate(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  return formatDuration(minutes);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
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
