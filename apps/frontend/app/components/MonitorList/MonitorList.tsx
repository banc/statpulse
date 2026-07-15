import type { Monitor } from '../../lib/dashboard-types';
import { MonitorListItem } from '../MonitorListItem';
import { IconButton, Panel } from '../ui';
import styles from './MonitorList.module.css';

type MonitorListProps = {
  monitors: Monitor[];
  selectedMonitorId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onToggleActive: (monitor: Monitor) => void;
};

export function MonitorList({ monitors, selectedMonitorId, onSelect, onAdd, onToggleActive }: MonitorListProps) {
  return (
    <Panel className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Monitors</h2>
          <p className={styles.description}>Status, uptime, latency, and incident load.</p>
        </div>
        <IconButton type="button" aria-label="Add monitor" onClick={onAdd}>
          <svg
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </IconButton>
      </div>

      <div className={styles.list}>
        {monitors.length > 0 ? (
          monitors.map((monitor) => (
            <MonitorListItem
              key={monitor.id}
              monitor={monitor}
              isSelected={selectedMonitorId === monitor.id}
              onSelect={onSelect}
              onToggleActive={onToggleActive}
            />
          ))
        ) : (
          <div className={styles.emptyState}>No monitors yet. Create one to start collecting uptime data.</div>
        )}
      </div>
    </Panel>
  );
}
