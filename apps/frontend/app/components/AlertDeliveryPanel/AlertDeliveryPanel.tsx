import type { Delivery } from '../../lib/dashboard-types';
import { DeliveryItem } from '../DeliveryItem';
import styles from './AlertDeliveryPanel.module.css';

type AlertDeliveryPanelProps = {
  deliveries: Delivery[];
};

export function AlertDeliveryPanel({ deliveries }: AlertDeliveryPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Alert delivery</h2>
          <p className={styles.description}>Telegram and email delivery log preview.</p>
        </div>
        <button className={styles.manageButton} type="button">
          Manage
        </button>
      </div>
      <div className={styles.list}>
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => <DeliveryItem key={delivery.id} delivery={delivery} />)
        ) : (
          <div className={styles.emptyState}>No alert deliveries yet.</div>
        )}
      </div>
    </section>
  );
}
