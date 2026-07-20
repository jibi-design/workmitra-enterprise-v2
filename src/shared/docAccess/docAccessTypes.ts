// App: Job Mitra / WorkMitra_Enterprise_v2
// File: docAccessTypes.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\shared\docAccess\docAccessTypes.ts

export type DocAccessFolder = {
  id: string;
  name: string;
  icon: string;
  visibility: "visible" | "hidden";
  sortOrder: number;
  createdAt: number;
};

export type DocAccessDocument = {
  id: string;
  folderId: string;
  name: string;
  fileType: "image" | "pdf";
  base64Data: string;
  thumbnailBase64: string;
  expiryDate: string | null;
  uploadedAt: number;
};

export type DocAccessProfile = {
  workerId?: string;
  fullName?: string;
  city?: string;
  experience?: string;
  skills: string[];
  languages: string[];
};
