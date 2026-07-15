import type { NewMonitorInput } from '../../lib/dashboard-types';
import { MonitorFormCard } from '../MonitorForm';

type CreateMonitorCardProps = {
  isSubmitting: boolean;
  errorMessage?: string;
  onCreate: (input: NewMonitorInput) => Promise<void>;
};

export function CreateMonitorCard({ isSubmitting, errorMessage, onCreate }: CreateMonitorCardProps) {
  return (
    <MonitorFormCard
      title="New monitor"
      description="Add an HTTP check to the workspace."
      initialValues={{
        name: 'Public landing',
        url: 'https://statpulse.dev',
        method: 'GET',
        expectedStatus: 200,
        intervalSeconds: 60,
        timeoutMs: 10000,
      }}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      submitLabel="Create monitor"
      submittingLabel="Creating..."
      onSubmit={onCreate}
    />
  );
}
