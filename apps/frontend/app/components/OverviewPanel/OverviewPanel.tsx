import { MetricTile } from '../MetricTile';
import { SummaryCard } from '../SummaryCard';
import styles from './OverviewPanel.module.css';

type OverviewPanelProps = {
  healthyCount: number;
  totalCount: number;
  averageLatency: number;
  activeIncidents: number;
};

export function OverviewPanel({ healthyCount, totalCount, averageLatency, activeIncidents }: OverviewPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.topLine}>
        <div>
          <p className={styles.eyebrow}>Operations overview</p>
          <h1 className={styles.title}>Service health</h1>
        </div>
        <div className={styles.metrics}>
          <MetricTile label="Healthy" value={`${healthyCount}/${totalCount}`} />
          <MetricTile label="Latency" value={`${averageLatency}ms`} />
          <MetricTile label="Incidents" value={String(activeIncidents)} accent />
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <SummaryCard title="Global uptime" value="99.64%" detail="+0.08% vs yesterday" tone="teal" />
        <SummaryCard title="Checks today" value="18,420" detail="Every 60 seconds" tone="indigo" />
        <SummaryCard title="Alerts sent" value="37" detail="2 channels active" tone="rose" />
      </div>
    </section>
  );
}
