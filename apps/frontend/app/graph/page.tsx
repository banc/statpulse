import { DashboardWorkspace, GraphPageContent } from '../components/DashboardWorkspace';

export default function GraphPage() {
  return (
    <DashboardWorkspace activePage="graph" title="Graph">
      <GraphPageContent />
    </DashboardWorkspace>
  );
}
