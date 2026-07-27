// App name: Job Mitra
// Workspace lookup helpers for direct-invite merge pipeline.

const WORKSPACES_KEY = "wm_employee_shift_workspaces_v1";

type WorkspaceRec = {
  id?: string;
  postId?: string;
  workerMlId?: string;
  status?: string;
};

function readWorkspaces(): WorkspaceRec[] {
  try {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkspaceRec[]) : [];
  } catch {
    return [];
  }
}

export function findWorkspaceIdForPostAndWorker(
  postId: string,
  workerMlId?: string,
): string | null {
  const workspaces = readWorkspaces().filter((item) => item.postId === postId);

  if (workspaces.length === 0) return null;

  if (workerMlId) {
    const key = workerMlId.trim().toUpperCase();
    const match = workspaces.find(
      (item) => item.workerMlId?.trim().toUpperCase() === key && typeof item.id === "string",
    );
    if (match?.id) return match.id;
  }

  const first = workspaces.find((item) => typeof item.id === "string");
  return first?.id ?? null;
}
