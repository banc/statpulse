import { cx } from '../../lib/class-name';
import styles from './ResponseChart.module.css';

type ResponseChartProps = {
  monitorId: string;
  checks: number[];
};

export function ResponseChart({ monitorId, checks }: ResponseChartProps) {
  const maxLatency = Math.max(...checks, 1);

  return (
    <div className={styles.chartPanel}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Response time</h3>
          <p className={styles.description}>Last 12 checks</p>
        </div>
        <span className={styles.pollingBadge}>60s polling</span>
      </div>
      <div className={styles.chart} aria-label="Response time chart">
        {checks.map((value, index) => (
          <div key={`${monitorId}-${index}`} className={styles.barColumn}>
            <div className={styles.barTrack}>
              <div
                className={cx(styles.bar, value === 0 && styles.timeout, value > 400 && styles.slow)}
                style={{ height: `${value === 0 ? 10 : Math.max(14, (value / maxLatency) * 100)}%` }}
                title={`${value} ms`}
              />
            </div>
            <span className={styles.axisLabel}>{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
