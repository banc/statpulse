import type { Monitor } from '../../lib/dashboard-types';
import { MonitorListItem } from '../MonitorListItem';
import styles from './MonitorList.module.css';

type MonitorListProps = {
  monitors: Monitor[];
  selectedMonitorId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
};

export function MonitorList({ monitors, selectedMonitorId, onSelect, onAdd }: MonitorListProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Monitors</h2>
          <p className={styles.description}>Status, uptime, latency, and incident load.</p>
        </div>
        <button className={styles.addButton} type="button" aria-label="Add monitor" onClick={onAdd}>
          +
        </button>
      </div>

      <div className={styles.list}>
        {monitors.length > 0 ? (
          monitors.map((monitor) => (
            <MonitorListItem
              key={monitor.id}
              monitor={monitor}
              isSelected={selectedMonitorId === monitor.id}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className={styles.emptyState}>No monitors yet. Create one to start collecting uptime data.</div>
        )}
      </div>
    </section>
  );
}
