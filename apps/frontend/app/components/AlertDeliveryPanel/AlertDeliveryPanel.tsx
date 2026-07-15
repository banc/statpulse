import { FormEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Delivery } from '../../lib/dashboard-types';
import { DeliveryItem } from '../DeliveryItem';
import { Button, IconButton, Panel } from '../ui';
import styles from './AlertDeliveryPanel.module.css';

type AlertDeliveryPanelProps = {
  deliveries: Delivery[];
};

export function AlertDeliveryPanel({ deliveries }: AlertDeliveryPanelProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    telegramEnabled: true,
    telegramTarget: '@statpulse-oncall',
    telegramCooldown: 300,
    emailEnabled: true,
    emailTarget: 'ops@statpulse.dev',
    emailCooldown: 600,
  });

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsOpen]);

  return (
    <Panel className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Alert delivery</h2>
          <p className={styles.description}>Telegram and email delivery log preview.</p>
        </div>
        <IconButton type="button" aria-label="Manage alert delivery settings" onClick={() => setIsSettingsOpen(true)}>
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
        </IconButton>
      </div>
      <div className={styles.list}>
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => <DeliveryItem key={delivery.id} delivery={delivery} />)
        ) : (
          <div className={styles.emptyState}>No alert deliveries yet.</div>
        )}
      </div>

      {isSettingsOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setIsSettingsOpen(false)}>
              <div
                aria-modal="true"
                aria-labelledby="alert-settings-title"
                className={styles.modalPanel}
                role="dialog"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <IconButton
                  className={styles.modalClose}
                  type="button"
                  aria-label="Close alert settings"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  <CloseIcon />
                </IconButton>
                <AlertSettingsForm
                  settings={settings}
                  onSubmit={(nextSettings) => {
                    setSettings(nextSettings);
                    setIsSettingsOpen(false);
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

type AlertSettings = {
  telegramEnabled: boolean;
  telegramTarget: string;
  telegramCooldown: number;
  emailEnabled: boolean;
  emailTarget: string;
  emailCooldown: number;
};

type AlertSettingsFormProps = {
  settings: AlertSettings;
  onSubmit: (settings: AlertSettings) => void;
};

function AlertSettingsForm({ settings, onSubmit }: AlertSettingsFormProps) {
  const [telegramEnabled, setTelegramEnabled] = useState(settings.telegramEnabled);
  const [telegramTarget, setTelegramTarget] = useState(settings.telegramTarget);
  const [telegramCooldown, setTelegramCooldown] = useState(settings.telegramCooldown);
  const [emailEnabled, setEmailEnabled] = useState(settings.emailEnabled);
  const [emailTarget, setEmailTarget] = useState(settings.emailTarget);
  const [emailCooldown, setEmailCooldown] = useState(settings.emailCooldown);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      telegramEnabled,
      telegramTarget,
      telegramCooldown,
      emailEnabled,
      emailTarget,
      emailCooldown,
    });
  }

  return (
    <Panel as="aside" className={styles.settingsCard}>
      <form className={styles.settingsForm} onSubmit={handleSubmit}>
        <div className={styles.settingsHeader}>
          <div>
            <h2 id="alert-settings-title" className={styles.settingsTitle}>
              Alert delivery settings
            </h2>
            <p className={styles.settingsDescription}>Configure local routing preview for incident notifications.</p>
          </div>
        </div>

        <section className={styles.channelSettings}>
          <label className={styles.toggle}>
            <input checked={telegramEnabled} type="checkbox" onChange={(event) => setTelegramEnabled(event.target.checked)} />
            Telegram enabled
          </label>
          <label className={styles.field}>
            Target
            <input className={styles.control} value={telegramTarget} onChange={(event) => setTelegramTarget(event.target.value)} />
          </label>
          <label className={styles.field}>
            Cooldown seconds
            <input
              className={styles.control}
              inputMode="numeric"
              min={60}
              step={60}
              type="number"
              value={telegramCooldown}
              onChange={(event) => setTelegramCooldown(Number(event.target.value))}
            />
          </label>
        </section>

        <section className={styles.channelSettings}>
          <label className={styles.toggle}>
            <input checked={emailEnabled} type="checkbox" onChange={(event) => setEmailEnabled(event.target.checked)} />
            Email enabled
          </label>
          <label className={styles.field}>
            Target
            <input className={styles.control} type="email" value={emailTarget} onChange={(event) => setEmailTarget(event.target.value)} />
          </label>
          <label className={styles.field}>
            Cooldown seconds
            <input
              className={styles.control}
              inputMode="numeric"
              min={60}
              step={60}
              type="number"
              value={emailCooldown}
              onChange={(event) => setEmailCooldown(Number(event.target.value))}
            />
          </label>
        </section>

        <div className={styles.formActions}>
          <Button className={styles.submitButton} type="submit" variant="primary">
            Save settings
          </Button>
        </div>
      </form>
    </Panel>
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
