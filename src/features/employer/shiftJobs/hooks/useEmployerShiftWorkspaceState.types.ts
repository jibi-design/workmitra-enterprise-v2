// App name: Job Mitra
// useEmployerShiftWorkspaceState.types.ts

export type WorkspaceDraft = {
  title: string;
  body: string;
};

export function hasWorkspaceEmployerRating(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
