import { cx } from '../../lib/class-name';
import type { Incident } from '../../lib/dashboard-types';
import { MiniStat } from '../MiniStat';
import styles from './IncidentCard.module.css';

type IncidentCardProps = {
  incident: Incident;
};

export function IncidentCard({ incident }: IncidentCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.monitor}>{incident.monitor}</p>
          <h3 className={styles.title}>{incident.title}</h3>
        </div>
        <span className={cx(styles.badge, incident.status === 'open' ? styles.open : styles.resolved)}>
          {incident.status}
        </span>
      </div>
      <div className={styles.metaGrid}>
        <MiniStat label="Started" value={incident.startedAt} />
        <MiniStat label="Duration" value={incident.duration} />
      </div>
    </article>
  );
}
