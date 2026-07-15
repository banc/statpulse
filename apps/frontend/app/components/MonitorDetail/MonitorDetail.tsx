'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Monitor } from '../../lib/dashboard-types';
import { MonitorFormCard } from '../MonitorForm';
import { MiniStat } from '../MiniStat';
import { ResponseChart } from '../ResponseChart';
import { StatusPill } from '../StatusPill';
import { SummaryStrip } from '../SummaryStrip';
import { Button, IconButton, Panel } from '../ui';
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
  isActive?: boolean;
};

export function MonitorDetail({ monitor, isSaving, errorMessage, onUpdate, onDelete }: MonitorDetailProps) {
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  useEffect(() => {
    if (!isEditingSettings) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsEditingSettings(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditingSettings]);

  if (!monitor) {
    return (
      <Panel className={styles.panel}>
        <div className={styles.emptyState}>
          <p className={styles.emptyEyebrow}>No monitor selected</p>
          <h2 className={styles.title}>Create a monitor to unlock details, charts, and incidents.</h2>
          <p className={styles.url}>The dashboard will update as soon as the first check result arrives.</p>
        </div>
      </Panel>
    );
  }

  return (
    <Panel className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.identity}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{monitor.name}</h2>
            <StatusPill status={monitor.status} />
          </div>
          <p className={styles.url}>{monitor.url}</p>
        </div>
        <div className={styles.headerAside}>
          <IconButton type="button" aria-label="Edit monitor" onClick={() => setIsEditingSettings(true)}>
            <EditIcon />
          </IconButton>
          <div className={styles.metaGrid}>
            <MiniStat label="Method" value={monitor.method} />
            <MiniStat label="Expect" value={String(monitor.expectedStatus)} />
            <MiniStat label="Region" value={monitor.region} />
          </div>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <SummaryStrip label="Last checked" value={monitor.lastChecked} />
        <SummaryStrip label="30d uptime" value={`${monitor.uptime}%`} />
        <SummaryStrip label="Current latency" value={monitor.latency === 0 ? 'timeout' : `${monitor.latency}ms`} />
      </div>

      <ResponseChart monitorId={monitor.id} checks={monitor.checks} />

      {isEditingSettings && typeof document !== 'undefined'
        ? createPortal(
            <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setIsEditingSettings(false)}>
              <div
                aria-modal="true"
                className={styles.modalPanel}
                role="dialog"
                aria-labelledby="edit-monitor-title"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <IconButton
                  className={styles.modalClose}
                  type="button"
                  aria-label="Close monitor settings"
                  onClick={() => setIsEditingSettings(false)}
                >
                  <CloseIcon />
                </IconButton>
                <MonitorSettings
                  key={monitor.id}
                  monitor={monitor}
                  isSaving={isSaving}
                  errorMessage={errorMessage}
                  onUpdate={async (id, input) => {
                    await onUpdate(id, input);
                    setIsEditingSettings(false);
                  }}
                  onDelete={async (id) => {
                    await onDelete(id);
                    setIsEditingSettings(false);
                  }}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </Panel>
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
  return (
    <MonitorFormCard
      title="Edit monitor"
      description="Update schedule, target, and expected response."
      initialValues={{
        name: monitor.name,
        url: monitor.url,
        method: monitor.method as MonitorUpdateInput['method'],
        expectedStatus: monitor.expectedStatus,
        intervalSeconds: monitor.intervalSeconds ?? 60,
        timeoutMs: monitor.timeoutMs ?? 10000,
      }}
      isSubmitting={isSaving}
      errorMessage={errorMessage}
      submitLabel="Save changes"
      submittingLabel="Saving..."
      onSubmit={(input) => onUpdate(monitor.id, input)}
      footerAction={
        <Button
          className={styles.deleteButton}
          type="button"
          variant="danger"
          disabled={isSaving}
          onClick={() => void onDelete(monitor.id)}
        >
        Delete
      </Button>
      }
    />
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}
