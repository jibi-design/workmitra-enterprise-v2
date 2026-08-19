/** Job Mitra | homeTickerLayout.ts | Unified [Badge] — Title | Next-step ticker copy */

import { extractAppliedPostName } from "./homeStripRowCopy";
import type { InboxTickerItem } from "./latestUnreadInboxPreview";

export type HomeTickerLayout = {
  readonly badge: string;
  readonly headline: string;
  readonly context: string;
};

const GENERIC_TITLE = /your shift post|your career job post|this shift|this role|open role/i;
const RATE_SIG = /\[(?:EMPLOYMENT|SHIFT)_PLEASE_RATE:/i;
const ACTIONABLE_BADGES = new Set([
  "Action Required",
  "Rating Needed",
  "New Applicant",
  "New Candidate",
  "Offer / Update",
  "Incoming Call",
  "Shift Active",
  "Identity Check",
  "Employment Action",
]);

function clean(value: string, fallback: string): string {
  const next = value.replace(/\s+/g, " ").replace(/[.[\]']+$/g, "").trim();
  if (!next || GENERIC_TITLE.test(next)) return fallback;
  return next;
}

function firstNameClause(body: string): string {
  const applied = body.match(/^([A-Za-z][\w .'-]{1,40}?)\s+applied\b/i);
  if (applied?.[1]) return applied[1].trim();
  const resigned = body.match(/^([A-Za-z][\w .'-]{1,40}?)\s+has submitted/i);
  if (resigned?.[1]) return resigned[1].trim();
  const possessive = body.match(/^([A-Za-z][\w .'-]{1,40}?)(?:'s)\s+employment/i);
  if (possessive?.[1]) return possessive[1].trim();
  return "A worker";
}

function extractJobTitle(item: InboxTickerItem, fallback: string): string {
  const body = (item.body ?? "").replace(RATE_SIG, "").trim();
  const applied = body ? extractAppliedPostName(body) : null;
  if (applied) return clean(applied, fallback);
  const parts = body.split(" · ").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2 && /^(applied|shortlisted)$/i.test(parts[0])) {
    return clean(parts[1], fallback);
  }
  const asRole = body.match(/\bas\s+(.+?)(?:\s+at\s+|\.|$)/i);
  if (asRole?.[1]) return clean(asRole[1], fallback);
  const fromRole = body.match(/\bfrom\s+(.+?)\.?$/i);
  if (fromRole?.[1]) return clean(fromRole[1], fallback);
  if (body && body.length <= 72 && !GENERIC_TITLE.test(body) && !/\[/.test(body)) {
    const clause = body.split(/[.—]/)[0]?.trim() ?? "";
    if (clause && !/applied to your/i.test(clause) && !/please rate/i.test(clause)) {
      return clean(clause, fallback);
    }
  }
  return fallback;
}

function extractCompany(item: InboxTickerItem, fallback: string): string {
  const body = (item.body ?? "").replace(RATE_SIG, "");
  const at = body.match(/\bat\s+([^.[\]]+?)(?:\.|$)/i);
  if (at?.[1]) return clean(at[1], fallback);
  const parts = (item.body ?? "").split(" · ").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 3) return clean(parts[2], fallback);
  return fallback;
}

function extractCaller(item: InboxTickerItem): string {
  const blob = `${item.title} ${item.body ?? ""}`;
  const match = blob.match(/call from\s+(.+?)(?:\s+\||\.|$)/i);
  return clean(match?.[1] ?? "", "a caller");
}

export function formatHomeTickerLayoutLine(layout: HomeTickerLayout): string {
  const head = `[${layout.badge}] — ${layout.headline}`;
  return layout.context ? `${head} | ${layout.context}` : head;
}

export function isActionableTickerLayout(layout: HomeTickerLayout): boolean {
  return ACTIONABLE_BADGES.has(layout.badge);
}

export function buildHomeTickerLayout(item: InboxTickerItem): HomeTickerLayout {
  const title = item.title;
  const body = item.body ?? "";
  const blob = `${title}\n${body}`;
  const job = extractJobTitle(item, item.domain === "career" ? "this role" : "this shift");

  if (/incoming call|call from/i.test(blob)) {
    return {
      badge: "Incoming Call",
      headline: `Call from ${extractCaller(item)}`,
      context: "Tap to open workspace",
    };
  }
  if (/verif|identity|profile update needed|please check this/i.test(blob) && item.domain === "system") {
    return {
      badge: "Identity Check",
      headline: "Account verification update needed",
      context: "",
    };
  }

  if (item.domain === "employment" || (RATE_SIG.test(body) && /employment/i.test(body))) {
    if (/please rate/i.test(title) || RATE_SIG.test(body)) {
      return {
        badge: "Rating Needed",
        headline: `Employment: ${extractCompany(item, "this workplace")}`,
        context: "Please rate your employment experience",
      };
    }
    if (/resignation received|auto-completed|force/i.test(blob) || /resignation withdrawn/i.test(title)) {
      return {
        badge: "Employment Action",
        headline: firstNameClause(body),
        context: "Employment record updated",
      };
    }
    return {
      badge: "Employment Update",
      headline: extractCompany(item, job),
      context: "Status updated for your personal diary",
    };
  }

  if (item.domain === "career") {
    if (/offer|interview|shortlisted/i.test(title)) {
      return {
        badge: "Offer / Update",
        headline: `Career: ${job}`,
        context: "You have an active offer or interview invite",
      };
    }
    if (/new career application|new candidate/i.test(title)) {
      return {
        badge: "New Candidate",
        headline: `Career: ${job}`,
        context: "New profile submitted for review",
      };
    }
    return {
      badge: "Applied",
      headline: `Career: ${job}`,
      context: "Application received and under review",
    };
  }

  if (/please rate/i.test(title) || RATE_SIG.test(body) || /shift completed/i.test(title)) {
    return {
      badge: "Rating Needed",
      headline: `Shift: ${job}`,
      context: "Please rate your shift experience",
    };
  }
  if (/check-in|shift in progress|shift active/i.test(blob)) {
    return {
      badge: "Shift Active",
      headline: job,
      context: "Shift in progress — Check-in required",
    };
  }
  if (/shortlisted|confirm you'll|confirmation required|confirm your availability/i.test(title)) {
    return {
      badge: "Action Required",
      headline: `Shift: ${job}`,
      context: "You are shortlisted! Please confirm your availability",
    };
  }
  if (/new shift application|new applicant/i.test(title) || /applied to your shift/i.test(body)) {
    return {
      badge: "New Applicant",
      headline: `Shift: ${job}`,
      context: `${firstNameClause(body)} applied for this shift`,
    };
  }
  if (isWorkGroupTickerItem(item)) {
    const reply = /^reply \(/i.test(item.title.trim());
    const headline = clean(item.title, reply ? "Work group reply" : "Broadcast");
    const context = (item.body ?? "").trim() || (reply ? "Open the work group" : "Open the work group for this update");
    return {
      badge: reply ? "Reply" : "Broadcast",
      headline,
      context,
    };
  }

  return {
    badge: "Applied",
    headline: `Shift: ${job}`,
    context: "Application under review by employer",
  };
}

function isWorkGroupTickerItem(item: InboxTickerItem): boolean {
  const title = item.title.trim();
  const blob = `${title}\n${item.body ?? ""}`;
  if (/confirmed for this shift|you're confirmed|you are confirmed/i.test(title)) return false;
  if (/^announcement$/i.test(title)) return true;
  if (/^reply \((employee|employer)\)$/i.test(title)) return true;
  if (/\/shift\/workspace/i.test(item.route ?? "") && !/application (submitted|received)|shortlisted/i.test(blob)) {
    return true;
  }
  return /broadcast|work group update/i.test(blob);
}
