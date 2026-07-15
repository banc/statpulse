import { cx } from '../../lib/class-name';
import type { Delivery } from '../../lib/dashboard-types';
import styles from './DeliveryItem.module.css';

type DeliveryItemProps = {
  delivery: Delivery;
};

export function DeliveryItem({ delivery }: DeliveryItemProps) {
  return (
    <article className={styles.item}>
      <div className={styles.body}>
        <p className={styles.channel}>{delivery.channel}</p>
        <p className={styles.event}>{delivery.event}</p>
      </div>
      <div className={styles.meta}>
        <span className={cx(styles.badge, styles[delivery.status])}>{delivery.status}</span>
        <span className={styles.time}>{delivery.time}</span>
      </div>
    </article>
  );
}
