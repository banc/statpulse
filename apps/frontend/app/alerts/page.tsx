import { AlertsPageContent, DashboardWorkspace } from '../components/DashboardWorkspace';

export default function AlertsPage() {
  return (
    <DashboardWorkspace activePage="alerts" title="Alerts">
      <AlertsPageContent />
    </DashboardWorkspace>
  );
}
