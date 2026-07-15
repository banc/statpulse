import { cx } from '../../lib/class-name';
import styles from './AppHeader.module.css';

export type AppPage = 'dashboard' | 'monitors' | 'incidents' | 'alerts' | 'graph';
type AppIcon =
  | 'dashboard'
  | 'activity'
  | 'incident'
  | 'bell'
  | 'trend'
  | 'rocket'
  | 'shield'
  | 'phone'
  | 'file'
  | 'settings'
  | 'search';

const quickAccessItems = [
  { label: 'Active Incidents', icon: 'incident', target: 'incidents' },
  { label: 'Recent Alerts', icon: 'bell', target: 'alerts' },
] as const;

const operationItems = [
  { label: 'Dashboard', icon: 'dashboard', target: 'dashboard' },
  { label: 'Incidents', icon: 'incident', target: 'incidents' },
  { label: 'Alerts', icon: 'bell', target: 'alerts' },
  { label: 'Performance', icon: 'trend', target: 'graph' },
] as const;

type AppHeaderProps = {
  activePage: AppPage;
  alertCount?: number;
  incidentCount?: number;
  userEmail?: string;
  onNavigate: (page: AppPage) => void;
};

export function AppHeader({ activePage, alertCount = 0, incidentCount = 0, userEmail, onNavigate }: AppHeaderProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandRow}>
        <div className={styles.logo} aria-hidden="true">
          <NavigationIcon icon="activity" />
        </div>
        <span className={styles.brandName}>Statpulse</span>
        {/* <span className={styles.liveBadge}>Live</span> */}
      </div>

      <nav className={styles.navigation} aria-label="Primary navigation">
        <p className={styles.sectionLabel}>Quick Access</p>
        {quickAccessItems.map((item) => (
          <button
            key={item.label}
            className={styles.navigationItem}
            type="button"
            onClick={() => onNavigate(item.target)}
          >
            <span className={styles.icon} aria-hidden="true">
              <NavigationIcon icon={item.icon} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}

        <p className={styles.sectionLabel}>Operations</p>
        {operationItems.map((item) => (
          <button
            key={item.label}
            className={cx(
              styles.navigationItem,
              activePage === item.target && styles.navigationItemActive,
            )}
            type="button"
            onClick={() => onNavigate(item.target)}
          >
            <span className={styles.icon} aria-hidden="true">
              <NavigationIcon icon={item.icon} />
            </span>
            <span>{item.label}</span>
            {getMenuBadge(item.target, { alertCount, incidentCount }) ? (
              <span className={styles.navBadge}>{getMenuBadge(item.target, { alertCount, incidentCount })}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.navigationItem} type="button">
          <span className={styles.icon} aria-hidden="true">
            <NavigationIcon icon="settings" />
          </span>
          <span>Settings</span>
        </button>
        <div className={styles.userCard}>
          <span className={styles.userAvatar}>JD</span>
          <span>
            <strong>John Doe</strong>
            <small>{userEmail ?? 'SRE Lead'}</small>
          </span>
        </div>
      </div>
    </aside>
  );
}

function getMenuBadge(page: AppPage, counts: { alertCount: number; incidentCount: number }) {
  if (page === 'incidents') {
    return counts.incidentCount > 0 ? String(counts.incidentCount) : undefined;
  }

  if (page === 'alerts') {
    return counts.alertCount > 0 ? String(counts.alertCount) : undefined;
  }

  return undefined;
}

function NavigationIcon({ icon }: { icon: AppIcon }) {
  const commonProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    viewBox: '0 0 24 24',
  } as const;

  if (icon === 'dashboard') {
    return (
      <svg {...commonProps}>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </svg>
    );
  }

  if (icon === 'activity') {
    return (
      <svg {...commonProps}>
        <path d="M3 12h4l2-6 4 12 2-6h6" />
      </svg>
    );
  }

  if (icon === 'incident') {
    return (
      <svg {...commonProps}>
        <path d="M12 4 3.5 19h17L12 4Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (icon === 'bell') {
    return (
      <svg {...commonProps}>
        <path d="M12 4a6 6 0 0 0-6 6v3.5L4.5 16h15L18 13.5V10a6 6 0 0 0-6-6Z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    );
  }

  if (icon === 'rocket') {
    return (
      <svg {...commonProps}>
        <path d="M5 15c-1 1.4-1.3 3-.8 4.8 1.8.5 3.4.2 4.8-.8" />
        <path d="M9 15 5 19" />
        <path d="M8 13 3 12l3-3" />
        <path d="m11 16 1 5 3-3" />
        <path d="M8 13c2.6-6.2 6.8-8.8 12-9-0.2 5.2-2.8 9.4-9 12Z" />
      </svg>
    );
  }

  if (icon === 'shield') {
    return (
      <svg {...commonProps}>
        <path d="M12 3 5 6v5c0 4.2 2.8 8 7 10 4.2-2 7-5.8 7-10V6Z" />
      </svg>
    );
  }

  if (icon === 'phone') {
    return (
      <svg {...commonProps}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.3 19.3 0 0 1-6-6A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.4 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.6.5 2.5.6A2 2 0 0 1 22 16.9Z" />
      </svg>
    );
  }

  if (icon === 'file') {
    return (
      <svg {...commonProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h6" />
      </svg>
    );
  }

  if (icon === 'settings') {
    return (
      <svg {...commonProps}>
        <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 1 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 20 7.1l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.8.8Z" />
      </svg>
    );
  }

  if (icon === 'search') {
    return (
      <svg {...commonProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M4 19h16" />
      <path d="M4 19V5" />
      <path d="m7 15 4-5 3 3 5-7" />
      <path d="M16 6h3v3" />
    </svg>
  );
}
