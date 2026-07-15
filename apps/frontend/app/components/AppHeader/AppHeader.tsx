import { cx } from '../../lib/class-name';
import styles from './AppHeader.module.css';

const pageItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'monitors', label: 'Monitors', icon: 'file' },
  { id: 'incidents', label: 'Incidents', icon: 'mail' },
  { id: 'alerts', label: 'Alerts', icon: 'alert' },
  { id: 'graph', label: 'Graph', icon: 'chart' },
] as const;

export type AppPage = (typeof pageItems)[number]['id'];

type AppHeaderProps = {
  activePage: AppPage;
  userEmail?: string;
  isAuthenticating: boolean;
  authError?: string;
  onNavigate: (page: AppPage) => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  onLogout: () => void;
};

export function AppHeader({ activePage, userEmail, onNavigate }: AppHeaderProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <div className={styles.avatar} aria-hidden="true">
          <span className={styles.avatarHead} />
          <span className={styles.avatarBody} />
        </div>
        <p className={styles.name}>JOHN DON</p>
        <p className={styles.email}>{userEmail ?? 'Johndon@company.com'}</p>
      </div>

      <nav className={styles.navigation} aria-label="Primary navigation">
        {pageItems.map((item) => (
          <button
            key={item.id}
            className={cx(styles.navigationItem, activePage === item.id && styles.navigationItemActive)}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            <span className={cx(styles.icon, styles[item.icon])} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
