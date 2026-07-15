import { cx } from '../../../lib/class-name';
import type { MonitorStatus } from '../../../lib/dashboard-types';
import styles from './StatusText.module.css';

type StatusTextProps = {
  status: MonitorStatus;
};

export function StatusText({ status }: StatusTextProps) {
  return <span className={cx(styles.status, styles[status.toLowerCase()])}>{status}</span>;
}
