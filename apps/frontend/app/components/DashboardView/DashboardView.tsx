'use client';

import { DashboardPageContent, DashboardWorkspace } from '../DashboardWorkspace';

export function DashboardView() {
  return (
    <DashboardWorkspace activePage="dashboard" title="Monitoring dashboard">
      <DashboardPageContent />
    </DashboardWorkspace>
  );
}
