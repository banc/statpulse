import { DashboardPageContent, DashboardWorkspace } from '../components/DashboardWorkspace';

export default function DashboardPage() {
  return (
    <DashboardWorkspace activePage="dashboard" title="Monitoring dashboard">
      <DashboardPageContent />
    </DashboardWorkspace>
  );
}
