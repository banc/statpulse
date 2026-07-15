'use client';

import { FormEvent, ReactNode, useState } from 'react';
import type { NewMonitorInput } from '../../lib/dashboard-types';
import { Button, Panel } from '../ui';
import styles from './MonitorForm.module.css';

export type MonitorFormValues = NewMonitorInput;

type MonitorFormProps = {
  initialValues: MonitorFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  errorMessage?: string;
  footerAction?: ReactNode;
  onSubmit: (input: MonitorFormValues) => Promise<void>;
};

type MonitorFormCardProps = MonitorFormProps & {
  title: string;
  description: string;
};

export function MonitorFormCard({ title, description, ...formProps }: MonitorFormCardProps) {
  return (
    <Panel as="aside" className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>
        <span className={styles.badge}>HTTP</span>
      </div>
      <MonitorForm {...formProps} />
    </Panel>
  );
}

export function MonitorForm({
  initialValues,
  isSubmitting,
  submitLabel,
  submittingLabel,
  errorMessage,
  footerAction,
  onSubmit,
}: MonitorFormProps) {
  const [name, setName] = useState(initialValues.name ?? '');
  const [url, setUrl] = useState(initialValues.url);
  const [method, setMethod] = useState<MonitorFormValues['method']>(initialValues.method);
  const [expectedStatus, setExpectedStatus] = useState(initialValues.expectedStatus);
  const [intervalSeconds, setIntervalSeconds] = useState(initialValues.intervalSeconds);
  const [timeoutMs, setTimeoutMs] = useState(initialValues.timeoutMs);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      name,
      url,
      method,
      expectedStatus,
      intervalSeconds,
      timeoutMs,
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        Name
        <input className={styles.control} value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className={styles.field}>
        URL
        <input className={styles.control} required type="url" value={url} onChange={(event) => setUrl(event.target.value)} />
      </label>
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          Method
          <select
            className={styles.control}
            value={method}
            onChange={(event) => setMethod(event.target.value as MonitorFormValues['method'])}
          >
            <option>GET</option>
            <option>HEAD</option>
          </select>
        </label>
        <label className={styles.field}>
          Status
          <input
            className={styles.control}
            inputMode="numeric"
            max={599}
            min={100}
            type="number"
            value={expectedStatus}
            onChange={(event) => setExpectedStatus(Number(event.target.value))}
          />
        </label>
      </div>
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          Interval
          <input
            className={styles.control}
            inputMode="numeric"
            min={30}
            type="number"
            value={intervalSeconds}
            onChange={(event) => setIntervalSeconds(Number(event.target.value))}
          />
        </label>
        <label className={styles.field}>
          Timeout
          <input
            className={styles.control}
            inputMode="numeric"
            max={30000}
            min={1000}
            step={500}
            type="number"
            value={timeoutMs}
            onChange={(event) => setTimeoutMs(Number(event.target.value))}
          />
        </label>
      </div>
      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
      <div className={styles.actions}>
        <Button className={styles.submitButton} type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
        {footerAction}
      </div>
    </form>
  );
}
