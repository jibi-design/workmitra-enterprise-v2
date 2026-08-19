/**
 * WAVE-5.1 Layer 3 — Zod request validation gate (raw Node HTTP).
 *
 * Validates body / query / params BEFORE controllers mutate state.
 * Unknown keys are stripped by Zod object schemas (anti mass-assignment).
 * Never trusts client-supplied role/userId fields for authorization.
 */

import type { ServerResponse } from "node:http";
import type { ZodType } from "zod";
import { sendJson } from "../utils/http.js";

export type ValidationIssue = {
  readonly path: string;
  readonly message: string;
};

export type ValidateOk<TBody, TQuery, TParams> = {
  readonly ok: true;
  readonly body: TBody;
  readonly query: TQuery;
  readonly params: TParams;
};

export type ValidateFail = {
  readonly ok: false;
};

export type ValidateResult<TBody, TQuery, TParams> =
  | ValidateOk<TBody, TQuery, TParams>
  | ValidateFail;

export type ValidateRequestInput<TBody, TQuery, TParams> = {
  readonly bodySchema?: ZodType<TBody>;
  readonly querySchema?: ZodType<TQuery>;
  readonly paramsSchema?: ZodType<TParams>;
  readonly body?: unknown;
  readonly query?: unknown;
  readonly params?: unknown;
};

function issuesFromZod(error: {
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>;
}): ValidationIssue[] {
  return error.issues.slice(0, 12).map((issue) => ({
    path: issue.path.map(String).join(".") || "(root)",
    message: issue.message,
  }));
}

/**
 * Send 400 VALIDATION_ERROR with sanitized field issues (no stack traces).
 */
export function sendSchemaValidationError(
  res: ServerResponse,
  requestId: string,
  issues: readonly ValidationIssue[],
  message = "Request failed schema validation",
): true {
  sendJson(res, 400, {
    error: {
      code: "VALIDATION_ERROR",
      message,
      details: issues,
      requestId,
    },
  });
  return true;
}

/**
 * validateRequest — parse body/query/params with Zod before the controller runs.
 *
 * Usage:
 *   const parsed = validateRequest({
 *     bodySchema: loginBodySchema,
 *     body,
 *   }, res, requestId);
 *   if (!parsed.ok) return;
 *   // parsed.body is typed
 */
export function validateRequest<
  TBody = Record<string, never>,
  TQuery = Record<string, never>,
  TParams = Record<string, never>,
>(
  input: ValidateRequestInput<TBody, TQuery, TParams>,
  res: ServerResponse,
  requestId: string,
): ValidateResult<TBody, TQuery, TParams> {
  const issues: ValidationIssue[] = [];

  let body = {} as TBody;
  let query = {} as TQuery;
  let params = {} as TParams;

  if (input.bodySchema) {
    const result = input.bodySchema.safeParse(input.body ?? {});
    if (!result.success) {
      issues.push(...issuesFromZod(result.error));
    } else {
      body = result.data;
    }
  }

  if (input.querySchema) {
    const result = input.querySchema.safeParse(input.query ?? {});
    if (!result.success) {
      issues.push(...issuesFromZod(result.error));
    } else {
      query = result.data;
    }
  }

  if (input.paramsSchema) {
    const result = input.paramsSchema.safeParse(input.params ?? {});
    if (!result.success) {
      issues.push(...issuesFromZod(result.error));
    } else {
      params = result.data;
    }
  }

  if (issues.length > 0) {
    sendSchemaValidationError(res, requestId, issues);
    return { ok: false };
  }

  return { ok: true, body, query, params };
}
