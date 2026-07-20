// Universal pending manual-action model — extensible for new domains (Workforce, HR, etc.)

export type PendingActionDomain = "shift" | "career" | (string & {});

export type PendingActionScope =
  | "employer-shift-home"
  | "employee-shift-home"
  | "employer-role-home"
  | "employee-role-home"
  | "employer-career-home"
  | "employee-career-home";

export type PendingActionItem = {
  id: string;
  domain: PendingActionDomain;
  label: string;
  detail: string;
  count: number;
  ctaLabel: string;
  pulseId?: string;
  onAction: () => void;
  /** Dual CTA row — direct invite safety flow (decline neutral + accept halo). */
  dualActions?: {
    declineLabel: string;
    acceptLabel: string;
    onDecline: () => void;
    onAccept: () => void;
    laterLabel?: string;
    onLater?: () => void;
  };
};

export type PendingActionsContext = {
  navigate: (path: string) => void;
  employerShiftReviewCount?: number;
  employeeShiftReviewCount?: number;
  careerEmployerFeedbackCount?: number;
  careerEmploymentFeedbackCount?: number;
};

export type PendingActionProvider = {
  id: string;
  scopes: readonly PendingActionScope[];
  resolve: (ctx: PendingActionsContext) => PendingActionItem | null;
};
