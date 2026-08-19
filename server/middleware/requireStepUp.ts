/**
 * Require consumed step-up token on high-risk handlers.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import {
  consumeStepUpToken,
  readStepUpHeader,
  type HighRiskStepUpPurpose,
} from "../modules/auth/stepUp.service.js";

export function requireStepUp(
  req: IncomingMessage,
  res: ServerResponse,
  purpose: HighRiskStepUpPurpose,
): boolean {
  const token = readStepUpHeader(req);
  const result = consumeStepUpToken(token, purpose);
  if (result.ok) return true;

  const message =
    result.code === "MISSING"
      ? "Step-up verification required. Re-authenticate and retry with X-WM-Step-Up."
      : result.code === "EXPIRED"
        ? "Step-up token expired. Request a new challenge."
        : result.code === "PURPOSE_MISMATCH"
          ? "Step-up token purpose mismatch for this action."
          : "Invalid step-up token.";

  res.statusCode = 403;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(
    JSON.stringify({
      ok: false,
      error: {
        code: "STEP_UP_REQUIRED",
        reason: result.code,
        purpose,
        message,
      },
    }),
  );
  return false;
}
