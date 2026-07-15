import { Panel } from '../ui';
import styles from './OverviewPanel.module.css';

type OverviewPanelProps = {
  healthyCount: number;
  totalCount: number;
  averageLatency: number;
  activeIncidents: number;
};

export function OverviewPanel({ healthyCount, totalCount, averageLatency, activeIncidents }: OverviewPanelProps) {
  const uptime = totalCount > 0 ? ((healthyCount / totalCount) * 100).toFixed(2) : '0.00';
  const errorRate = totalCount > 0 ? ((activeIncidents / totalCount) * 0.14).toFixed(2) : '0.00';
  const degradedCount = Math.max(totalCount - healthyCount - activeIncidents, 0);
  const cards = [
    {
      label: 'Active Incidents',
      value: String(activeIncidents),
      detail: `${totalCount} monitored services`,
      delta: activeIncidents > 0 ? 'needs review' : 'clear',
      tone: activeIncidents > 0 ? 'danger' : 'success',
      icon: 'incident',
      tooltip: 'Open incidents that currently need attention.',
    },
    {
      label: 'Healthy Services',
      value: `${healthyCount}/${totalCount}`,
      detail: degradedCount > 0 ? `${degradedCount} degraded` : 'all reporting normally',
      delta: `${uptime}%`,
      tone: 'success',
      icon: 'health',
      tooltip: 'Healthy services compared with all configured monitors.',
    },
    {
      label: 'Avg Latency',
      value: `${averageLatency}ms`,
      detail: averageLatency > 250 ? 'above target' : 'within target',
      delta: averageLatency > 250 ? '+18ms' : '-8ms',
      tone: averageLatency > 250 ? 'danger' : 'blue',
      icon: 'latency',
      tooltip: 'Average response time across active monitor checks.',
    },
    {
      label: 'Error Rate',
      value: `${errorRate}%`,
      detail: 'derived from open incidents',
      delta: '-0.12%',
      tone: 'success',
      icon: 'errorRate',
      tooltip: 'Estimated error rate derived from open incidents.',
    },
  ] as const;

  return (
    <section className={styles.panel} aria-label="System metrics">
      {cards.map((card) => (
        <Panel key={card.label} className={styles.card}>
          <span className={styles[card.tone]} tabIndex={0} aria-label={card.tooltip} data-tooltip={card.tooltip}>
            <SummaryIcon icon={card.icon} />
          </span>
          <p className={styles.label}>{card.label}</p>
          <p className={styles.value}>{card.value}</p>
          <p className={styles.detail}>
            <strong>{card.delta}</strong>
            {card.detail}
          </p>
        </Panel>
      ))}
    </section>
  );
}

type SummaryIconName = 'incident' | 'health' | 'latency' | 'errorRate';

function SummaryIcon({ icon }: { icon: SummaryIconName }) {
  const commonProps = {
    'aria-hidden': true,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    viewBox: '0 0 24 24',
  } as const;

  if (icon === 'incident') {
    return (
      <svg {...commonProps}>
        <path d="M12 4 3.5 19h17L12 4Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (icon === 'health') {
    return (
      <svg {...commonProps}>
        <path d="M20 7 9 18l-5-5" />
        <path d="M12 3a9 9 0 1 0 9 9" />
      </svg>
    );
  }

  if (icon === 'latency') {
    return (
      <svg {...commonProps}>
        <path d="M12 14 16 8" />
        <path d="M4 14a8 8 0 1 1 16 0" />
        <path d="M5 19h14" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 12 3 3 4-7 3 4" />
    </svg>
  );
}
