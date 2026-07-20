// App name: Job Mitra
// File name: careerCandidateCard.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\types\careerCandidateCard.types.ts

import type { CareerApplication, CareerJobPost } from "./careerTypes";
import type { CareerTab } from "../components/CareerPipelineTabs";

export type CareerCandidateCardProps = {
  app: CareerApplication;
  post: CareerJobPost;
  tab: CareerTab;
  isBusy: boolean;
  isBackupSuggestion?: boolean;
  onShortlist: (appId: string) => void;
  onRemoveFromShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
  onScheduleInterview: (appId: string, roundNumber: number) => void;
  onRecordResult: (appId: string, roundNumber: number) => void;
  onSendOffer: (appId: string) => void;
  onHire: (appId: string) => void;
  onEditNotes: (appId: string) => void;
};
