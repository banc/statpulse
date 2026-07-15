import { cx } from '../../lib/class-name';
import { Panel } from '../ui';
import styles from './ResponseChart.module.css';

type ResponseChartProps = {
  monitorId: string;
  checks: number[];
};

export function ResponseChart({ monitorId, checks }: ResponseChartProps) {
  const maxLatency = Math.max(...checks, 1);

  return (
    <Panel as="div" className={styles.chartPanel}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Response time</h3>
          <p className={styles.description}>Last 12 checks</p>
        </div>
        <span className={styles.pollingBadge}>60s polling</span>
      </div>
      <div className={styles.chart} aria-label="Response time chart">
        {checks.map((value, index) => {
          const isTimeout = value === 0;
          const state = isTimeout ? 'Timeout' : value > 400 ? 'Slow response' : 'Healthy response';
          const tooltip = `Check #${index + 1} / ${isTimeout ? 'timeout' : `${value}ms`} / ${state}`;

          return (
          <div key={`${monitorId}-${index}`} className={styles.barColumn} tabIndex={0} aria-label={tooltip} data-tooltip={tooltip}>
            <div className={styles.barTrack}>
              <div
                className={cx(styles.bar, value === 0 && styles.timeout, value > 400 && styles.slow)}
                style={{ height: `${value === 0 ? 10 : Math.max(14, (value / maxLatency) * 100)}%` }}
              />
            </div>
            <span className={styles.axisLabel}>{index + 1}</span>
          </div>
          );
        })}
      </div>
    </Panel>
  );
}
