import { DashboardWorkspace, MonitorsPageContent } from '../components/DashboardWorkspace';

export default function MonitorsPage() {
  return (
    <DashboardWorkspace activePage="monitors" title="Monitors">
      <MonitorsPageContent />
    </DashboardWorkspace>
  );
}
