// App name: Job Mitra
// File name: docAccessModal.types.ts
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\types\docAccessModal.types.ts

import type { DocAccessProfile } from "../docAccessTypes";

export type DocAccessDomain = "shift" | "career";

export type DocAccessStep = "requesting" | "otp" | "viewing";

export type DocAccessModalProps = {
  workerName: string;
  workerMlId: string;
  profile: DocAccessProfile;
  domain: DocAccessDomain;
  onClose: () => void;
};
