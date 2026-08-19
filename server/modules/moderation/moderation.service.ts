/**
 * Content report + admin moderation. Shift/Career isolated by domain field.
 */

import { isDbAuthEnabled } from "../auth/env.js";
import type { AuthUser } from "../auth/types.js";
import { emitUserNotification } from "../notifications/notifications.service.js";
import { moderationRepository } from "./moderation.repository.js";
import type {
  ContentCaseView,
  ContentReportDomain,
  ContentReportReason,
  ModerationActionKind,
} from "./moderation.types.js";
import { REPORT_RATE_LIMIT_24H, reportWeightForReason } from "./moderation.weight.js";

export type ModerationFail = {
  readonly ok: false;
  readonly code: string;
  readonly message: string;
  readonly httpStatus: number;
};

function storeFail(err: unknown): ModerationFail | null {
  if (typeof err !== "object" || err === null || !("code" in err)) return null;
  const code = (err as { code?: string }).code;
  if (code === "42P01") {
    return {
      ok: false,
      code: "MODERATION_STORE_NOT_READY",
      message: "Moderation store is not applied yet.",
      httpStatus: 503,
    };
  }
  if (code === "23505") {
    return {
      ok: false,
      code: "ALREADY_REPORTED",
      message: "You already reported this posting.",
      httpStatus: 409,
    };
  }
  return null;
}

function employerUuid(raw?: string): string | null {
  if (!raw) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)
    ? raw
    : null;
}

export const moderationService = {
  async createReport(
    reporter: AuthUser,
    domain: ContentReportDomain,
    postId: string,
    input: {
      reasonCode: ContentReportReason;
      note?: string;
      employerId?: string;
      snapshot?: { title?: string; companyName?: string };
    },
  ): Promise<{ ok: true; reportId: string; caseId: string } | ModerationFail> {
    if (!isDbAuthEnabled()) {
      return {
        ok: false,
        code: "MODERATION_STORE_NOT_READY",
        message: "Reporting requires the live API.",
        httpStatus: 503,
      };
    }
    if (input.reasonCode === "other" && !input.note) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Add a short note when choosing Other.",
        httpStatus: 400,
      };
    }
    try {
      const recent = await moderationRepository.countReporterLast24h(reporter.id);
      if (recent >= REPORT_RATE_LIMIT_24H) {
        return {
          ok: false,
          code: "REPORT_RATE_LIMIT",
          message: "You have reached the report limit for today.",
          httpStatus: 429,
        };
      }
      const weight = reportWeightForReason(input.reasonCode);
      const snapshot = {
        title: input.snapshot?.title?.trim().slice(0, 200) ?? "",
        companyName: input.snapshot?.companyName?.trim().slice(0, 200) ?? "",
      };
      const report = await moderationRepository.insertReport({
        domain,
        targetPostId: postId,
        employerId: employerUuid(input.employerId),
        reporterId: reporter.id,
        reasonCode: input.reasonCode,
        note: input.note,
        weight,
        snapshot,
      });
      const caseRow = await moderationRepository.upsertCase({
        domain,
        targetPostId: postId,
        employerId: employerUuid(input.employerId),
        weight,
      });
      await emitUserNotification({
        recipientUserId: reporter.id,
        domain: domain === "shift" ? "shift" : "career",
        eventType: "GENERAL_BROADCAST",
        title: "Report received",
        body: "Trust & Safety will review this posting. You will not see who else reported it.",
        route: domain === "shift" ? "/employee/shift/search" : "/employee/career/search",
        meta: { reportId: report.reportId, caseId: caseRow.caseId },
      });
      return { ok: true, reportId: report.reportId, caseId: caseRow.caseId };
    } catch (err) {
      return (
        storeFail(err) ?? {
          ok: false,
          code: "REPORT_FAILED",
          message: "Could not submit this report.",
          httpStatus: 500,
        }
      );
    }
  },

  async mine(
    reporter: AuthUser,
    domain: ContentReportDomain,
    postId: string,
  ): Promise<{ ok: true; reported: boolean } | ModerationFail> {
    if (!isDbAuthEnabled()) return { ok: true, reported: false };
    try {
      const row = await moderationRepository.findMine(reporter.id, domain, postId);
      return { ok: true, reported: Boolean(row) };
    } catch (err) {
      return storeFail(err) ?? { ok: true, reported: false };
    }
  },

  async listCases(
    status?: ContentCaseView["queueStatus"] | "all",
  ): Promise<{ ok: true; cases: ContentCaseView[] } | ModerationFail> {
    if (!isDbAuthEnabled()) {
      return { ok: true, cases: [] };
    }
    try {
      return { ok: true, cases: await moderationRepository.listCases(status) };
    } catch (err) {
      return (
        storeFail(err) ?? {
          ok: false,
          code: "MODERATION_LIST_FAILED",
          message: "Could not load the moderation queue.",
          httpStatus: 500,
        }
      );
    }
  },

  async act(
    admin: AuthUser,
    caseId: string,
    action: ModerationActionKind,
    note?: string,
  ): Promise<{ ok: true } | ModerationFail> {
    if (!isDbAuthEnabled()) {
      return {
        ok: false,
        code: "MODERATION_STORE_NOT_READY",
        message: "Moderation store is not applied yet.",
        httpStatus: 503,
      };
    }
    try {
      const current = await moderationRepository.getCase(caseId);
      if (!current) {
        return { ok: false, code: "NOT_FOUND", message: "Case not found.", httpStatus: 404 };
      }
      if (action === "dismiss") {
        await moderationRepository.applyCaseStatus({
          caseId,
          queueStatus: "cleared",
          hiddenAt: null,
          hiddenReason: null,
        });
        await moderationRepository.markReports({
          domain: current.domain,
          targetPostId: current.targetPostId,
          status: "dismissed",
        });
        await moderationRepository.setPostHidden(current.domain, current.targetPostId, false);
      } else if (action === "hide" || action === "remove") {
        await moderationRepository.applyCaseStatus({
          caseId,
          queueStatus: action === "remove" ? "removed" : "held",
          hiddenAt: new Date(),
          hiddenReason: "admin",
        });
        await moderationRepository.markReports({
          domain: current.domain,
          targetPostId: current.targetPostId,
          status: "upheld",
        });
        await moderationRepository.setPostHidden(current.domain, current.targetPostId, true);
      } else {
        await moderationRepository.applyCaseStatus({
          caseId,
          queueStatus: "cleared",
          hiddenAt: null,
          hiddenReason: null,
        });
        await moderationRepository.setPostHidden(current.domain, current.targetPostId, false);
      }
      await moderationRepository.insertAction({
        caseId,
        adminId: admin.id,
        action,
        note,
      });
      return { ok: true };
    } catch (err) {
      return (
        storeFail(err) ?? {
          ok: false,
          code: "MODERATION_ACTION_FAILED",
          message: "Could not apply this moderation action.",
          httpStatus: 500,
        }
      );
    }
  },
};
