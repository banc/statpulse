import styles from './MiniStat.module.css';

type MiniStatProps = {
  label: string;
  value: string;
};

export function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className={styles.stat}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  );
}
