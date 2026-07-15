import { cx } from '../../lib/class-name';
import type { Monitor } from '../../lib/dashboard-types';
import { MiniStat } from '../MiniStat';
import { StatusPill } from '../StatusPill';
import styles from './MonitorListItem.module.css';

type MonitorListItemProps = {
  monitor: Monitor;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export function MonitorListItem({ monitor, isSelected, onSelect }: MonitorListItemProps) {
  return (
    <button
      className={cx(styles.item, isSelected && styles.selected)}
      type="button"
      onClick={() => onSelect(monitor.id)}
    >
      <div className={styles.header}>
        <div className={styles.identity}>
          <p className={styles.name}>{monitor.name}</p>
          <p className={styles.url}>{monitor.url}</p>
        </div>
        <StatusPill status={monitor.status} />
      </div>
      <div className={styles.statGrid}>
        <MiniStat label="Uptime" value={`${monitor.uptime}%`} />
        <MiniStat label="Latency" value={monitor.latency === 0 ? 'timeout' : `${monitor.latency}ms`} />
        <MiniStat label="Issues" value={String(monitor.incidents)} />
      </div>
    </button>
  );
}
