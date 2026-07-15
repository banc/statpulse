import { cx } from '../../lib/class-name';
import type { MonitorStatus } from '../../lib/dashboard-types';
import styles from './StatusPill.module.css';

type StatusPillProps = {
  status: MonitorStatus;
};

export function StatusPill({ status }: StatusPillProps) {
  return <span className={cx(styles.pill, styles[status.toLowerCase()])}>{status}</span>;
}
