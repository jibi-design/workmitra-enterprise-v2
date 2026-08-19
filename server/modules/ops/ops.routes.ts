/**
 * Sprint 3 — ops flags routes for Super Admin actuators + public poll.
 * GET  /v1/jobmitra/ops/flags  — any client (maintenance gate)
 * PATCH /v1/jobmitra/ops/flags — requires WM_OPS_CONTROL_TOKEN Bearer (+ step-up for emergency)
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { resolveClientIp } from "../../middleware/clientIp.js";
import { requireStepUp } from "../../middleware/requireStepUp.js";
import {
  getRuntimeFlags,
  patchRuntimeFlags,
  writePlatformAudit,
} from "./runtimeFlags.service.js";
import { listAdminAudit } from "./adminAudit.service.js";
import {
  issueStepUpToken,
  opsStepUpSecretOk,
} from "../auth/stepUp.service.js";
import {
  anomalyBadgeSummary,
  listAnomalies,
} from "../../observability/anomalyDetector.js";

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw) as Record<string, unknown>);
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function opsTokenOk(req: IncomingMessage): boolean {
  const expected = process.env.WM_OPS_CONTROL_TOKEN?.trim();
  if (!expected || expected.length < 16) return false;
  const h = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return Boolean(m && m[1]?.trim() === expected);
}

function isEmergencyFlagPatch(body: Record<string, unknown>): boolean {
  return (
    body.maintenanceMode === true ||
    body.lockdown === true ||
    body.killShift === true ||
    body.killCareer === true ||
    body.killPlanner === true
  );
}

export async function handleOpsRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  method: string,
): Promise<boolean> {
  if (!pathname.startsWith("/v1/jobmitra/ops/")) return false;

  if (pathname === "/v1/jobmitra/ops/flags" && method === "GET") {
    const flags = await getRuntimeFlags();
    sendJson(res, 200, {
      ok: true,
      flags: {
        maintenanceMode: flags.maintenanceMode,
        lockdown: flags.lockdown,
        killShift: flags.killShift,
        killCareer: flags.killCareer,
        killPlanner: flags.killPlanner,
        updatedAtIso: flags.updatedAtIso,
        source: flags.source,
      },
    });
    return true;
  }

  if (pathname === "/v1/jobmitra/ops/step-up" && method === "POST") {
    if (!opsTokenOk(req)) {
      sendJson(res, 401, {
        ok: false,
        error: { code: "OPS_UNAUTHORIZED", message: "Ops control token required." },
      });
      return true;
    }
    try {
      const body = await readBody(req);
      const challenge = String(body.password || body.challenge || "");
      if (!opsStepUpSecretOk(challenge)) {
        await writePlatformAudit({
          who: String(body.who || "super-admin").slice(0, 120),
          what: "Ops step-up challenge failed.",
          tone: "red",
          action: "ops_step_up_failed",
          clientIp: resolveClientIp(req),
        });
        sendJson(res, 403, {
          ok: false,
          error: {
            code: "STEP_UP_DENIED",
            message: "Invalid step-up challenge.",
          },
        });
        return true;
      }
      const purpose =
        body.purpose === "bulk_user_delete" ||
        body.purpose === "database_backup_export" ||
        body.purpose === "admin_privilege_update" ||
        body.purpose === "privileged_admin_action"
          ? body.purpose
          : "ops_flags_emergency";
      const issued = issueStepUpToken({
        subject: String(body.who || "super-admin").slice(0, 120),
        purpose,
      });
      await writePlatformAudit({
        who: String(body.who || "super-admin").slice(0, 120),
        what: `Ops step-up issued for purpose=${purpose}.`,
        tone: "yellow",
        action: "ops_step_up_issued",
        clientIp: resolveClientIp(req),
        meta: { purpose, expiresAtIso: issued.expiresAtIso },
      });
      sendJson(res, 200, {
        ok: true,
        stepUpToken: issued.token,
        expiresAtIso: issued.expiresAtIso,
        purpose: issued.purpose,
        header: "X-WM-Step-Up",
      });
      return true;
    } catch {
      sendJson(res, 400, {
        ok: false,
        error: { code: "BAD_STEP_UP_BODY", message: "Could not issue step-up." },
      });
      return true;
    }
  }

  if (pathname === "/v1/jobmitra/ops/flags" && method === "PATCH") {
    if (!opsTokenOk(req)) {
      sendJson(res, 401, {
        ok: false,
        error: { code: "OPS_UNAUTHORIZED", message: "Ops control token required." },
      });
      return true;
    }
    try {
      const body = await readBody(req);
      if (isEmergencyFlagPatch(body)) {
        if (!requireStepUp(req, res, "ops_flags_emergency")) return true;
      }
      const who = String(body.updatedBy || "super-admin").slice(0, 120);
      const flags = await patchRuntimeFlags(
        {
          maintenanceMode:
            typeof body.maintenanceMode === "boolean" ? body.maintenanceMode : undefined,
          lockdown: typeof body.lockdown === "boolean" ? body.lockdown : undefined,
          killShift: typeof body.killShift === "boolean" ? body.killShift : undefined,
          killCareer: typeof body.killCareer === "boolean" ? body.killCareer : undefined,
          killPlanner: typeof body.killPlanner === "boolean" ? body.killPlanner : undefined,
        },
        who,
      );
      await writePlatformAudit({
        who,
        what: `Runtime flags updated (maintenance=${flags.maintenanceMode}, lockdown=${flags.lockdown}).`,
        tone: flags.lockdown || flags.maintenanceMode ? "red" : "yellow",
        action: "ops_flags_patch",
        clientIp: resolveClientIp(req),
        meta: { flags, emergency: isEmergencyFlagPatch(body) },
      });
      sendJson(res, 200, { ok: true, flags });
      return true;
    } catch {
      sendJson(res, 400, {
        ok: false,
        error: { code: "BAD_OPS_BODY", message: "Could not update flags." },
      });
      return true;
    }
  }

  if (pathname === "/v1/jobmitra/ops/audit" && method === "POST") {
    if (!opsTokenOk(req)) {
      sendJson(res, 401, {
        ok: false,
        error: { code: "OPS_UNAUTHORIZED", message: "Ops control token required." },
      });
      return true;
    }
    try {
      const body = await readBody(req);
      const who = String(body.who || "super-admin").slice(0, 120);
      const what = String(body.what || "")
        .trim()
        .slice(0, 2000);
      if (what.length < 3) {
        sendJson(res, 400, {
          ok: false,
          error: { code: "BAD_AUDIT", message: "Audit sentence too short." },
        });
        return true;
      }
      const tone =
        body.tone === "red" || body.tone === "green" || body.tone === "yellow"
          ? body.tone
          : "yellow";
      const written = await writePlatformAudit({
        who,
        what,
        tone,
        action: String(body.action || "privileged_action").slice(0, 120),
        clientIp: typeof body.clientIp === "string" ? body.clientIp : resolveClientIp(req),
        meta:
          body.meta && typeof body.meta === "object"
            ? (body.meta as Record<string, unknown>)
            : undefined,
      });
      sendJson(res, written.ok ? 200 : 503, {
        ok: written.ok,
        id: written.id,
        storage: written.ok ? "postgres" : "unavailable",
      });
      return true;
    } catch {
      sendJson(res, 400, {
        ok: false,
        error: { code: "BAD_AUDIT_BODY", message: "Could not write audit." },
      });
      return true;
    }
  }

  if (pathname === "/v1/jobmitra/ops/audit" && method === "GET") {
    if (!opsTokenOk(req)) {
      sendJson(res, 401, {
        ok: false,
        error: { code: "OPS_UNAUTHORIZED", message: "Ops control token required." },
      });
      return true;
    }
    const url = new URL(req.url ?? "/", "http://localhost");
    const limit = Number(url.searchParams.get("limit") || 50);
    const listed = await listAdminAudit(limit);
    sendJson(res, 200, {
      ok: listed.ok,
      entries: listed.entries,
      storage: listed.storage,
      immutable: true,
    });
    return true;
  }

  if (pathname === "/v1/jobmitra/ops/anomalies" && method === "GET") {
    if (!opsTokenOk(req)) {
      sendJson(res, 401, {
        ok: false,
        error: { code: "OPS_UNAUTHORIZED", message: "Ops control token required." },
      });
      return true;
    }
    const url = new URL(req.url ?? "/", "http://localhost");
    const limit = Number(url.searchParams.get("limit") || 40);
    sendJson(res, 200, {
      ok: true,
      badge: anomalyBadgeSummary(),
      events: listAnomalies(limit),
    });
    return true;
  }

  /** High-risk privileged action gate (backup/export/privilege) — step-up required. */
  if (pathname === "/v1/jobmitra/ops/privileged" && method === "POST") {
    if (!opsTokenOk(req)) {
      sendJson(res, 401, {
        ok: false,
        error: { code: "OPS_UNAUTHORIZED", message: "Ops control token required." },
      });
      return true;
    }
    try {
      const body = await readBody(req);
      const actionType = String(body.actionType || "privileged_admin_action");
      const purpose =
        actionType === "bulk_user_delete" ||
        actionType === "database_backup_export" ||
        actionType === "admin_privilege_update"
          ? actionType
          : "privileged_admin_action";
      if (!requireStepUp(req, res, purpose)) return true;
      const who = String(body.who || "super-admin").slice(0, 120);
      const target = body.target && typeof body.target === "object"
        ? (body.target as Record<string, unknown>)
        : {};
      await writePlatformAudit({
        who,
        what: `Privileged action acknowledged: ${purpose} (execute remains operator-owned; JM records ledger only).`,
        tone: "red",
        action: purpose,
        clientIp: resolveClientIp(req),
        meta: { target, note: body.note ? String(body.note).slice(0, 500) : null },
      });
      sendJson(res, 200, {
        ok: true,
        accepted: true,
        purpose,
        message:
          "Step-up verified. Action logged to immutable audit ledger. Downstream execute is operator-owned.",
      });
      return true;
    } catch {
      sendJson(res, 400, {
        ok: false,
        error: { code: "BAD_PRIVILEGED_BODY", message: "Could not process privileged action." },
      });
      return true;
    }
  }

  sendJson(res, 404, {
    ok: false,
    error: { code: "NOT_FOUND", message: "Unknown ops route." },
  });
  return true;
}
