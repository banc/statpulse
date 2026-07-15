import type { Incident } from '../../lib/dashboard-types';
import { IncidentCard } from '../IncidentCard';
import styles from './IncidentsPanel.module.css';

type IncidentsPanelProps = {
  incidents: Incident[];
};

export function IncidentsPanel({ incidents }: IncidentsPanelProps) {
  const openIncidents = incidents.filter((incident) => incident.status === 'open').length;

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Incidents</h2>
          <p className={styles.description}>Open and recently resolved monitor events.</p>
        </div>
        <span className={styles.openBadge}>{openIncidents} open</span>
      </div>
      <div className={styles.list}>
        {incidents.length > 0 ? (
          incidents.map((incident) => <IncidentCard key={incident.id} incident={incident} />)
        ) : (
          <div className={styles.emptyState}>No incidents for the selected monitor.</div>
        )}
      </div>
    </section>
  );
}
