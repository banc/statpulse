import { cx } from '../../lib/class-name';
import styles from './MetricTile.module.css';

type MetricTileProps = {
  label: string;
  value: string;
  accent?: boolean;
};

export function MetricTile({ label, value, accent = false }: MetricTileProps) {
  return (
    <div className={cx(styles.tile, accent && styles.accent)}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  );
}
