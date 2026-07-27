import type { CSSProperties } from "react";
import type { StaffExitReason } from "../storage/myStaff.storage";

export const EXIT_REASONS: { value: StaffExitReason; label: string }[] = [
  { value: "terminated", label: "Termination" },
  { value: "layoff", label: "Layoff" },
  { value: "contract_end", label: "Contract End" },
  { value: "mutual_agreement", label: "Mutual Agreement" },
];

export type StepHeaderProps = {
  step: number;
  title: string;
  titleColor?: string;
  employeeName: string;
  jobTitle: string;
};

export type BtnRowProps = {
  backLabel: string;
  onBack: () => void;
  nextLabel: string;
  onNext: () => void;
  nextEnabled: boolean;
  cancelBtn: CSSProperties;
  nextBtn: (enabled: boolean) => CSSProperties;
};

export type Step1Props = {
  employeeName: string;
  jobTitle: string;
  reason: StaffExitReason | "";
  onReasonChange: (r: StaffExitReason) => void;
  exitNote: string;
  onExitNoteChange: (note: string) => void;
  onNext: () => void;
  onCancel: () => void;
  cancelBtn: CSSProperties;
  nextBtn: (e: boolean) => CSSProperties;
};

export type Step2Props = {
  employeeName: string;
  jobTitle: string;
  dateStr: string;
  onDateChange: (d: string) => void;
  todayStr: string;
  dateValid: boolean;
  onNext: () => void;
  onBack: () => void;
  cancelBtn: CSSProperties;
  nextBtn: (e: boolean) => CSSProperties;
};

export type Step3Props = {
  employeeName: string;
  jobTitle: string;
  rating: number;
  onRatingChange: (r: number) => void;
  comment: string;
  onCommentChange: (c: string) => void;
  onNext: () => void;
  onBack: () => void;
  cancelBtn: CSSProperties;
  nextBtn: (e: boolean) => CSSProperties;
};

export type Step4Props = {
  employeeName: string;
  onDone: () => void;
};
