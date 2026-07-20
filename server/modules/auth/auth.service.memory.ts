import { createHash, timingSafeEqual } from "node:crypto";
import { isDemoAuthAllowed } from "./env.js";
import type { AuthUser, UserRole } from "./types.js";

interface StoredUser extends AuthUser {
  passwordHash: string;
}

export type LoginResult =
  { ok: true; user: AuthUser } | { ok: false; code: string; message: string; httpStatus?: number };

function hashPasswordDev(password: string): string {
  return createHash("sha256").update(`wm-dev:${password}`).digest("hex");
}

function verifyPasswordDev(password: string, passwordHash: string): boolean {
  const candidate = Buffer.from(hashPasswordDev(password));
  const expected = Buffer.from(passwordHash);
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function buildDemoUsers(): StoredUser[] {
  return [
    {
      id: "usr_employee_demo",
      fullName: "Demo Employee",
      email: "employee@demo.jobmitra.app",
      role: "employee",
      passwordHash: hashPasswordDev("demo1234"),
    },
    {
      id: "usr_employer_demo",
      fullName: "Demo Employer",
      email: "employer@demo.jobmitra.app",
      role: "employer",
      passwordHash: hashPasswordDev("demo1234"),
    },
  ];
}

const users: StoredUser[] = isDemoAuthAllowed() ? buildDemoUsers() : [];

function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}

export const memoryAuthService = {
  login(email: string, password: string): LoginResult {
    if (!isDemoAuthAllowed()) {
      return {
        ok: false,
        code: "DEMO_AUTH_DISABLED",
        message: "Demo authentication is not available in this environment",
        httpStatus: 403,
      };
    }

    const normalized = email.trim().toLowerCase();
    const user = users.find((u) => u.email === normalized);
    if (!user || !verifyPasswordDev(password, user.passwordHash)) {
      return {
        ok: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        httpStatus: 401,
      };
    }
    return { ok: true, user: toPublicUser(user) };
  },

  getUserById(userId: string): AuthUser | null {
    const user = users.find((u) => u.id === userId);
    return user ? toPublicUser(user) : null;
  },

  isRole(value: unknown): value is UserRole {
    return value === "employee" || value === "employer" || value === "admin";
  },
};
