import { cx } from '../../lib/class-name';
import type { Monitor } from '../../lib/dashboard-types';
import { StatusPill } from '../StatusPill';
import styles from './MonitorListItem.module.css';

type MonitorListItemProps = {
  monitor: Monitor;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleActive: (monitor: Monitor) => void;
};

export function MonitorListItem({ monitor, isSelected, onSelect, onToggleActive }: MonitorListItemProps) {
  const isActive = monitor.isActive ?? true;

  return (
    <button
      className={cx(styles.item, !isActive && styles.inactive, isSelected && styles.selected)}
      type="button"
      onClick={() => onSelect(monitor.id)}
    >
      <div className={styles.header}>
        <div className={styles.identity}>
          <p className={styles.name}>{monitor.name}</p>
          <p className={styles.url}>{monitor.url}</p>
        </div>
        <div className={styles.actions}>
          <StatusPill status={monitor.status} />
          <span
            className={cx(styles.toggle, isActive && styles.toggleActive)}
            role="switch"
            aria-checked={isActive}
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onToggleActive(monitor);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                onToggleActive(monitor);
              }
            }}
          >
            <span />
          </span>
        </div>
      </div>
      <div className={styles.metaLine}>
        <span>{monitor.uptime}% uptime</span>
        <span>{monitor.latency === 0 ? 'timeout' : `${monitor.latency}ms`}</span>
        <span>{isActive ? `${monitor.incidents} issues` : 'paused'}</span>
      </div>
    </button>
  );
}
