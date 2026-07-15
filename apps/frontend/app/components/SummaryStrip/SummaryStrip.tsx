import styles from './SummaryStrip.module.css';

type SummaryStripProps = {
  label: string;
  value: string;
};

export function SummaryStrip({ label, value }: SummaryStripProps) {
  return (
    <div className={styles.strip}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  );
}
