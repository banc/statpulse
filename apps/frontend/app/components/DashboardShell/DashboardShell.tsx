import type { ReactNode } from 'react';
import styles from './DashboardShell.module.css';

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className={styles.screen}>
      <div className={styles.container}>{children}</div>
    </main>
  );
}
