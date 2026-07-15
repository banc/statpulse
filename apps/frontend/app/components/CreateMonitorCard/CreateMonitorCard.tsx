import { FormEvent, useState } from 'react';
import type { NewMonitorInput } from '../../lib/dashboard-types';
import styles from './CreateMonitorCard.module.css';

type CreateMonitorCardProps = {
  isSubmitting: boolean;
  errorMessage?: string;
  onCreate: (input: NewMonitorInput) => Promise<void>;
};

export function CreateMonitorCard({ isSubmitting, errorMessage, onCreate }: CreateMonitorCardProps) {
  const [name, setName] = useState('Public landing');
  const [url, setUrl] = useState('https://statpulse.dev');
  const [method, setMethod] = useState<NewMonitorInput['method']>('GET');
  const [expectedStatus, setExpectedStatus] = useState(200);
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  const [timeoutMs, setTimeoutMs] = useState(10000);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onCreate({
      name,
      url,
      method,
      expectedStatus,
      intervalSeconds,
      timeoutMs,
    });
  }

  return (
    <aside className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>New monitor</h2>
          <p className={styles.description}>Add an HTTP check to the workspace.</p>
        </div>
        <span className={styles.badge}>HTTP</span>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          Name
          <input className={styles.control} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className={styles.field}>
          URL
          <input
            className={styles.control}
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />
        </label>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            Method
            <select
              className={styles.control}
              value={method}
              onChange={(event) => setMethod(event.target.value as NewMonitorInput['method'])}
            >
              <option>GET</option>
              <option>HEAD</option>
            </select>
          </label>
          <label className={styles.field}>
            Status
            <input
              className={styles.control}
              value={expectedStatus}
              inputMode="numeric"
              min={100}
              max={599}
              type="number"
              onChange={(event) => setExpectedStatus(Number(event.target.value))}
            />
          </label>
        </div>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            Interval
            <input
              className={styles.control}
              value={intervalSeconds}
              inputMode="numeric"
              min={30}
              type="number"
              onChange={(event) => setIntervalSeconds(Number(event.target.value))}
            />
          </label>
          <label className={styles.field}>
            Timeout
            <input
              className={styles.control}
              value={timeoutMs}
              inputMode="numeric"
              min={1000}
              max={30000}
              step={500}
              type="number"
              onChange={(event) => setTimeoutMs(Number(event.target.value))}
            />
          </label>
        </div>
        {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
        <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create monitor'}
        </button>
      </form>
    </aside>
  );
}
