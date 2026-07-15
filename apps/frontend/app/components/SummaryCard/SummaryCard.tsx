import type { SummaryTone } from '../../lib/dashboard-types';
import { cx } from '../../lib/class-name';
import styles from './SummaryCard.module.css';

type SummaryCardProps = {
  title: string;
  value: string;
  detail: string;
  tone: SummaryTone;
};

export function SummaryCard({ title, value, detail, tone }: SummaryCardProps) {
  return (
    <article className={cx(styles.card, styles[tone])}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>{value}</p>
      <p className={styles.detail}>{detail}</p>
    </article>
  );
}
