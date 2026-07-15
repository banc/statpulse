'use client';

import { FormEvent, useState } from 'react';
import type { Monitor } from '../../lib/dashboard-types';
import { MiniStat } from '../MiniStat';
import { ResponseChart } from '../ResponseChart';
import { StatusPill } from '../StatusPill';
import { SummaryStrip } from '../SummaryStrip';
import styles from './MonitorDetail.module.css';

type MonitorDetailProps = {
  monitor?: Monitor;
  isSaving: boolean;
  errorMessage?: string;
  onUpdate: (id: string, input: MonitorUpdateInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export type MonitorUpdateInput = {
  name?: string;
  url: string;
  method: 'GET' | 'HEAD';
  expectedStatus: number;
  intervalSeconds: number;
  timeoutMs: number;
  isActive: boolean;
};

export function MonitorDetail({ monitor, isSaving, errorMessage, onUpdate, onDelete }: MonitorDetailProps) {
  if (!monitor) {
    return (
      <section className={styles.panel}>
        <div className={styles.emptyState}>
          <p className={styles.emptyEyebrow}>No monitor selected</p>
          <h2 className={styles.title}>Create a monitor to unlock details, charts, and incidents.</h2>
          <p className={styles.url}>The dashboard will update as soon as the first check result arrives.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.identity}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{monitor.name}</h2>
            <StatusPill status={monitor.status} />
          </div>
          <p className={styles.url}>{monitor.url}</p>
        </div>
        <div className={styles.metaGrid}>
          <MiniStat label="Method" value={monitor.method} />
          <MiniStat label="Expect" value={String(monitor.expectedStatus)} />
          <MiniStat label="Region" value={monitor.region} />
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <SummaryStrip label="Last checked" value={monitor.lastChecked} />
        <SummaryStrip label="30d uptime" value={`${monitor.uptime}%`} />
        <SummaryStrip label="Current latency" value={monitor.latency === 0 ? 'timeout' : `${monitor.latency}ms`} />
      </div>

      <ResponseChart monitorId={monitor.id} checks={monitor.checks} />

      <MonitorSettings
        key={monitor.id}
        monitor={monitor}
        isSaving={isSaving}
        errorMessage={errorMessage}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </section>
  );
}

type MonitorSettingsProps = {
  monitor: Monitor;
  isSaving: boolean;
  errorMessage?: string;
  onUpdate: (id: string, input: MonitorUpdateInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function MonitorSettings({ monitor, isSaving, errorMessage, onUpdate, onDelete }: MonitorSettingsProps) {
  const [name, setName] = useState(monitor.name);
  const [url, setUrl] = useState(monitor.url);
  const [method, setMethod] = useState<MonitorUpdateInput['method']>(monitor.method as MonitorUpdateInput['method']);
  const [expectedStatus, setExpectedStatus] = useState(monitor.expectedStatus);
  const [intervalSeconds, setIntervalSeconds] = useState(monitor.intervalSeconds ?? 60);
  const [timeoutMs, setTimeoutMs] = useState(monitor.timeoutMs ?? 10000);
  const [isActive, setIsActive] = useState(monitor.isActive ?? true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onUpdate(monitor.id, {
      name,
      url,
      method,
      expectedStatus,
      intervalSeconds,
      timeoutMs,
      isActive,
    });
  }

  return (
    <form className={styles.settingsForm} onSubmit={handleSubmit}>
      <div className={styles.settingsHeader}>
        <div>
          <h3 className={styles.settingsTitle}>Monitor settings</h3>
          <p className={styles.settingsDescription}>Control schedule, target, and expected response.</p>
        </div>
        <label className={styles.toggle}>
          <input checked={isActive} type="checkbox" onChange={(event) => setIsActive(event.target.checked)} />
          Active
        </label>
      </div>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          Name
          <input className={styles.control} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className={styles.field}>
          URL
          <input
            className={styles.control}
            required
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          Method
          <select
            className={styles.control}
            value={method}
            onChange={(event) => setMethod(event.target.value as MonitorUpdateInput['method'])}
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
      <div className={styles.formActions}>
        <button className={styles.saveButton} type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
        <button className={styles.deleteButton} type="button" disabled={isSaving} onClick={() => void onDelete(monitor.id)}>
          Delete
        </button>
      </div>
    </form>
  );
}
