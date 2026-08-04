import { createHash, timingSafeEqual } from "node:crypto";
import { isDemoAuthAllowed } from "./env.js";
import {
  applySessionContext,
  defaultEntitlementsForRole,
  initialActiveMode,
} from "./activeContext.helpers.js";
import type { AuthUser, UserRole } from "./types.js";

interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
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
    {
      id: "usr_employer_b_demo",
      fullName: "Demo Employer B",
      email: "employer-b@demo.jobmitra.app",
      role: "employer",
      passwordHash: hashPasswordDev("demo1234"),
    },
  ];
}

const users: StoredUser[] = isDemoAuthAllowed() ? buildDemoUsers() : [];
const passwordResetTokens = new Map<string, { userId: string; expiresAt: number }>();

function toPublicUser(user: StoredUser): AuthUser {
  const activeMode = initialActiveMode(user.role);
  return applySessionContext(
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      entitlements: defaultEntitlementsForRole(user.role),
    },
    { activeMode, activeOrgId: null },
  );
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

  register(input: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  }): LoginResult {
    if (!isDemoAuthAllowed()) {
      return {
        ok: false,
        code: "DEMO_AUTH_DISABLED",
        message: "Self-serve registration is not available in this environment",
        httpStatus: 403,
      };
    }
    if (input.role === "admin") {
      return {
        ok: false,
        code: "FORBIDDEN_ROLE",
        message: "Admin accounts cannot be self-registered",
        httpStatus: 403,
      };
    }
    const normalized = input.email.trim().toLowerCase();
    if (users.some((u) => u.email === normalized)) {
      return {
        ok: false,
        code: "EMAIL_TAKEN",
        message: "An account with this email already exists",
        httpStatus: 409,
      };
    }
    const user: StoredUser = {
      id: `usr_${input.role}_${Date.now().toString(16)}`,
      fullName: input.fullName.trim(),
      email: normalized,
      role: input.role,
      passwordHash: hashPasswordDev(input.password),
    };
    users.push(user);
    return { ok: true, user: toPublicUser(user) };
  },

  requestPasswordReset(email: string): { ok: true; debugToken?: string } {
    const normalized = email.trim().toLowerCase();
    const user = users.find((u) => u.email === normalized);
    // Anti-enumeration: always succeed. Token only when the account exists + demo on.
    if (!user || !isDemoAuthAllowed()) {
      return { ok: true };
    }
    const token = createHash("sha256")
      .update(`wm-reset:${user.id}:${Date.now()}:${Math.random()}`)
      .digest("hex")
      .slice(0, 48);
    passwordResetTokens.set(token, {
      userId: user.id,
      expiresAt: Date.now() + 1000 * 60 * 30,
    });
    return {
      ok: true,
      debugToken: process.env.NODE_ENV === "production" ? undefined : token,
    };
  },

  resetPassword(token: string, password: string): LoginResult {
    if (!isDemoAuthAllowed()) {
      return {
        ok: false,
        code: "DEMO_AUTH_DISABLED",
        message: "Password reset is not available in this environment",
        httpStatus: 403,
      };
    }
    const entry = passwordResetTokens.get(token);
    if (!entry || entry.expiresAt < Date.now()) {
      passwordResetTokens.delete(token);
      return {
        ok: false,
        code: "INVALID_RESET_TOKEN",
        message: "This reset link is invalid or has expired",
        httpStatus: 400,
      };
    }
    const user = users.find((u) => u.id === entry.userId);
    if (!user) {
      passwordResetTokens.delete(token);
      return {
        ok: false,
        code: "INVALID_RESET_TOKEN",
        message: "This reset link is invalid or has expired",
        httpStatus: 400,
      };
    }
    user.passwordHash = hashPasswordDev(password);
    passwordResetTokens.delete(token);
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
