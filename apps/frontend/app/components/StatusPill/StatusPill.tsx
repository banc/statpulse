import type { MonitorStatus } from '../../lib/dashboard-types';
import { StatusText } from '../ui';

type StatusPillProps = {
  status: MonitorStatus;
};

export function StatusPill({ status }: StatusPillProps) {
  return <StatusText status={status} />;
}
