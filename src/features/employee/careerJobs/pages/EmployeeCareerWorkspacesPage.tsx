// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeCareerWorkspacesPage.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\pages\EmployeeCareerWorkspacesPage.tsx

import { EmployeeCareerWorkspaceCard } from "../components/EmployeeCareerWorkspaceCard";
import { EmployeeCareerWorkspacesEmptyState } from "../components/EmployeeCareerWorkspacesEmptyState";
import { EmployeeCareerWorkspacesHero } from "../components/EmployeeCareerWorkspacesHero";
import { useEmployeeCareerWorkspacesPage } from "../hooks/useEmployeeCareerWorkspacesPage";

export function EmployeeCareerWorkspacesPage() {
  const page = useEmployeeCareerWorkspacesPage();

  return (
    <div className="wm-ee-vCareer wm-stackGrid">
      <EmployeeCareerWorkspacesHero />

      <section className="wm-stackGrid" style={{ marginBottom: 24 }}>
        {page.workspaces.length === 0 && <EmployeeCareerWorkspacesEmptyState />}

        {page.workspaces.map((workspace) => (
          <EmployeeCareerWorkspaceCard
            key={workspace.id}
            workspace={workspace}
            feedbackTasks={page.feedbackTasks}
            onOpen={() => page.openWorkspace(workspace.id)}
          />
        ))}
      </section>
    </div>
  );
}
