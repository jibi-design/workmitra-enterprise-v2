/**
 * Sprint 3 — ops flags routes for Super Admin actuators + public poll.
 * GET  /v1/jobmitra/ops/flags  — any client (maintenance gate)
 * PATCH /v1/jobmitra/ops/flags — requires WM_OPS_CONTROL_TOKEN Bearer
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { resolveClientIp } from "../../middleware/clientIp.js";
import { getRuntimeFlags, patchRuntimeFlags, writePlatformAudit } from "./runtimeFlags.service.js";

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
        meta: { flags },
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

  sendJson(res, 404, {
    ok: false,
    error: { code: "NOT_FOUND", message: "Unknown ops route." },
  });
  return true;
}
