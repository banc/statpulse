import styles from './ConnectionBanner.module.css';

type ConnectionBannerProps = {
  mode: 'demo' | 'loading' | 'live' | 'error';
  message: string;
  userEmail?: string;
  onRefresh: () => void;
  onLogout?: () => void;
};

export function ConnectionBanner({ mode, message, userEmail, onRefresh, onLogout }: ConnectionBannerProps) {
  return (
    <section className={styles.banner} data-mode={mode}>
      <div>
        <p className={styles.label}>{mode === 'live' ? 'Local workspace' : mode === 'loading' ? 'Syncing' : 'Demo data'}</p>
        <p className={styles.message}>{userEmail ? `${message} Signed in as ${userEmail}.` : message}</p>
      </div>
      <div className={styles.actions}>
        <button className={styles.secondaryButton} type="button" onClick={onRefresh}>
          Refresh
        </button>
        {onLogout ? (
          <button className={styles.primaryButton} type="button" onClick={onLogout}>
            Logout
          </button>
        ) : null}
      </div>
    </section>
  );
}
