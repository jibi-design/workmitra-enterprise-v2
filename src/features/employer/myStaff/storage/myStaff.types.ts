export type StaffStatus =
  "joining_pending" | "active" | "probation" | "resignation_pending" | "notice_period" | "exited";

export type StaffExitReason =
  "resigned" | "terminated" | "layoff" | "contract_end" | "mutual_agreement";

export type StaffEmploymentType = "full_time" | "part_time" | "contract";

export type StaffDepartmentHistoryEntry = {
  id: string;
  fromDepartmentId?: string;
  fromDepartmentName?: string;
  toDepartmentId: string;
  toDepartmentName: string;
  movedAt: number;
  note?: string;
};

export type StaffRecord = {
  id: string;
  employeeUniqueId: string;
  employeeName: string;
  jobTitle: string;
  category: string;
  employmentType: StaffEmploymentType;
  departmentId?: string;
  departmentName?: string;
  departmentHistory?: StaffDepartmentHistoryEntry[];
  joinedAt: number;
  exitedAt?: number;
  status: StaffStatus;
  exitReason?: StaffExitReason;
  employerRating?: number;
  employerComment?: string;
  addMethod: "via_app" | "manually_added";
  careerPostId?: string;
  /** Present when staff was activated from a Shift confirm hire. */
  shiftPostId?: string;
  employeeConfirmed: boolean;
  createdAt: number;
  updatedAt: number;
};

export type StaffDepartment = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type StaffCategory = {
  id: string;
  name: string;
  createdAt: number;
};
