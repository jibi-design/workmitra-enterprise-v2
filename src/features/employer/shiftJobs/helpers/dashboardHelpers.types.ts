export type Tab = "applied" | "shortlist" | "waiting" | "confirmed" | "rejected";
export type AnswerState = "meets" | "not_sure" | "dont_meet";
export type WorkspaceStatus = "active" | "upcoming" | "completed" | "left" | "replaced";

export type WorkspaceLite = {
  id: string;
  postId: string;
  status: WorkspaceStatus;
  lastActivityAt: number;
  startAt: number;
};
