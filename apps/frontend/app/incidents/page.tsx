import { DashboardWorkspace, IncidentsPageContent } from '../components/DashboardWorkspace';

export default function IncidentsPage() {
  return (
    <DashboardWorkspace activePage="incidents" title="Incidents">
      <IncidentsPageContent />
    </DashboardWorkspace>
  );
}
