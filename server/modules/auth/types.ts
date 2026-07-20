export type UserRole = "employee" | "employer" | "admin";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface SessionRecord {
  userId: string;
  createdAt: number;
  expiresAt: number;
}
