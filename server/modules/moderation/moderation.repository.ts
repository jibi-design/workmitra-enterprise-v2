/**
 * Postgres access for content reports. Isolated from Shift/Career domain services.
 */

import { getPool } from "../../db/pool.js";
import type {
  ContentCaseStatus,
  ContentCaseView,
  ContentReportDomain,
  ContentReportReason,
} from "./moderation.types.js";

function iso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value ?? "");
}

export const moderationRepository = {
  async countReporterLast24h(reporterId: string): Promise<number> {
    const result = await getPool().query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM content_reports
       WHERE reporter_employee_id = $1 AND created_at > now() - interval '24 hours'`,
      [reporterId],
    );
    return Number(result.rows[0]?.n ?? 0);
  },

  async insertReport(params: {
    domain: ContentReportDomain;
    targetPostId: string;
    employerId: string | null;
    reporterId: string;
    reasonCode: ContentReportReason;
    note?: string;
    weight: number;
    snapshot: Record<string, unknown>;
  }): Promise<{ reportId: string; createdAt: string }> {
    const result = await getPool().query(
      `INSERT INTO content_reports (
         domain, target_post_id, target_employer_id, reporter_employee_id,
         reason_code, note, weight, snapshot_json
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING report_id, created_at`,
      [
        params.domain,
        params.targetPostId,
        params.employerId,
        params.reporterId,
        params.reasonCode,
        params.note ?? null,
        params.weight,
        JSON.stringify(params.snapshot),
      ],
    );
    const row = result.rows[0] as { report_id: string; created_at: unknown };
    return { reportId: String(row.report_id), createdAt: iso(row.created_at) };
  },

  async findMine(
    reporterId: string,
    domain: ContentReportDomain,
    postId: string,
  ): Promise<{ reportId: string } | null> {
    const result = await getPool().query<{ report_id: string }>(
      `SELECT report_id FROM content_reports
       WHERE reporter_employee_id = $1 AND domain = $2 AND target_post_id = $3`,
      [reporterId, domain, postId],
    );
    const row = result.rows[0];
    return row ? { reportId: row.report_id } : null;
  },

  async upsertCase(params: {
    domain: ContentReportDomain;
    targetPostId: string;
    employerId: string | null;
    weight: number;
  }): Promise<{ caseId: string; weightedScore: number; openCount: number }> {
    const result = await getPool().query(
      `INSERT INTO content_report_cases (
         domain, target_post_id, employer_id, open_count, weighted_score, queue_status
       ) VALUES ($1, $2, $3, 1, $4, 'open')
       ON CONFLICT (domain, target_post_id)
       DO UPDATE SET
         open_count = content_report_cases.open_count + 1,
         weighted_score = content_report_cases.weighted_score + EXCLUDED.weighted_score,
         employer_id = COALESCE(EXCLUDED.employer_id, content_report_cases.employer_id),
         queue_status = CASE
           WHEN content_report_cases.queue_status IN ('cleared', 'removed')
             THEN 'open'
           WHEN content_report_cases.weighted_score + EXCLUDED.weighted_score >= 3
             THEN 'triage'
           ELSE content_report_cases.queue_status
         END,
         updated_at = now()
       RETURNING case_id, weighted_score, open_count`,
      [params.domain, params.targetPostId, params.employerId, params.weight],
    );
    const row = result.rows[0] as {
      case_id: string;
      weighted_score: string;
      open_count: number;
    };
    return {
      caseId: String(row.case_id),
      weightedScore: Number(row.weighted_score),
      openCount: Number(row.open_count),
    };
  },

  async listCases(status?: ContentCaseStatus | "all"): Promise<ContentCaseView[]> {
    const result = await getPool().query(
      `SELECT c.case_id, c.domain, c.target_post_id, c.employer_id, c.open_count,
              c.weighted_score, c.queue_status, c.updated_at,
              (
                SELECT r.snapshot_json->>'title' FROM content_reports r
                WHERE r.domain = c.domain AND r.target_post_id = c.target_post_id
                ORDER BY r.created_at DESC LIMIT 1
              ) AS title,
              (
                SELECT r.snapshot_json->>'companyName' FROM content_reports r
                WHERE r.domain = c.domain AND r.target_post_id = c.target_post_id
                ORDER BY r.created_at DESC LIMIT 1
              ) AS company_name
       FROM content_report_cases c
       WHERE (
         ($1::text IS NULL AND c.queue_status IN ('open', 'triage', 'held'))
         OR $1 = 'all'
         OR c.queue_status = $1
       )
       ORDER BY c.updated_at DESC
       LIMIT 200`,
      [status ?? null],
    );
    return result.rows.map((row) => {
      const rec = row as Record<string, unknown>;
      return {
        caseId: String(rec.case_id),
        domain: rec.domain as ContentReportDomain,
        targetPostId: String(rec.target_post_id),
        employerId: rec.employer_id == null ? null : String(rec.employer_id),
        openCount: Number(rec.open_count),
        weightedScore: Number(rec.weighted_score),
        queueStatus: rec.queue_status as ContentCaseView["queueStatus"],
        title: rec.title == null ? null : String(rec.title),
        companyName: rec.company_name == null ? null : String(rec.company_name),
        updatedAt: iso(rec.updated_at),
      };
    });
  },

  async getCase(caseId: string): Promise<ContentCaseView | null> {
    const result = await getPool().query(
      `SELECT c.case_id, c.domain, c.target_post_id, c.employer_id, c.open_count,
              c.weighted_score, c.queue_status, c.updated_at,
              NULL::text AS title, NULL::text AS company_name
       FROM content_report_cases c
       WHERE c.case_id = $1`,
      [caseId],
    );
    const rec = result.rows[0] as Record<string, unknown> | undefined;
    if (!rec) return null;
    return {
      caseId: String(rec.case_id),
      domain: rec.domain as ContentReportDomain,
      targetPostId: String(rec.target_post_id),
      employerId: rec.employer_id == null ? null : String(rec.employer_id),
      openCount: Number(rec.open_count),
      weightedScore: Number(rec.weighted_score),
      queueStatus: rec.queue_status as ContentCaseView["queueStatus"],
      title: null,
      companyName: null,
      updatedAt: iso(rec.updated_at),
    };
  },

  async applyCaseStatus(params: {
    caseId: string;
    queueStatus: ContentCaseStatus;
    hiddenAt: Date | null;
    hiddenReason: "admin" | null;
  }): Promise<void> {
    await getPool().query(
      `UPDATE content_report_cases
       SET queue_status = $2, hidden_at = $3, hidden_reason = $4, updated_at = now()
       WHERE case_id = $1`,
      [params.caseId, params.queueStatus, params.hiddenAt, params.hiddenReason],
    );
  },

  async markReports(params: {
    domain: ContentReportDomain;
    targetPostId: string;
    status: "upheld" | "dismissed";
  }): Promise<void> {
    await getPool().query(
      `UPDATE content_reports SET status = $3
       WHERE domain = $1 AND target_post_id = $2 AND status IN ('submitted', 'in_review')`,
      [params.domain, params.targetPostId, params.status],
    );
  },

  async insertAction(params: {
    caseId: string;
    adminId: string;
    action: string;
    note?: string;
  }): Promise<void> {
    await getPool().query(
      `INSERT INTO content_moderation_actions (case_id, actor_admin_id, action, note)
       VALUES ($1, $2, $3, $4)`,
      [params.caseId, params.adminId, params.action, params.note ?? null],
    );
  },

  async setPostHidden(domain: ContentReportDomain, postId: string, hidden: boolean): Promise<void> {
    const uuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(postId);
    if (!uuid) return;
    const table = domain === "shift" ? "shift_posts" : "career_posts";
    await getPool().query(
      `UPDATE ${table}
       SET details = jsonb_set(COALESCE(details, '{}'::jsonb), '{isHiddenFromSearch}', $2::jsonb, true),
           updated_at = now()
       WHERE id = $1::uuid`,
      [postId, JSON.stringify(hidden)],
    );
  },
};
