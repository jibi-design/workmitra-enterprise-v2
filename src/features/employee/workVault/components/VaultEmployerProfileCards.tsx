// src/features/employee/workVault/components/VaultEmployerProfileCards.tsx
//
// Sub-components for VaultVerifyEmployerTab.
// ProfileCard, StatsCard, TagsCard, ReviewsCard.

import {
  EMPLOYER_LEVEL_COLORS,
  EMPLOYER_LEVEL_BG,
  type EmployerPublicProfile,
  type EmployerReview,
} from "../../../../shared/employerProfile/employerPublicProfileService";

/* ── Helpers ───────────────────────────────────── */

function fmtDate(ts: number): string {
  try { return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
  catch { return ""; }
}

function fmtRelative(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 86400000);
  if (diff < 1) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return `${diff} days ago`;
  return fmtDate(ts);
}

function starString(n: number): string {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

/* ── ProfileCard ───────────────────────────────── */

export function ProfileCard({ profile }: { profile: EmployerPublicProfile }) {
  const lc = EMPLOYER_LEVEL_COLORS[profile.level];
  const lb = EMPLOYER_LEVEL_BG[profile.level];
  const has = profile.totalRatings > 0;
  return (
    <div className="wm-ee-card" style={{ marginTop: 12 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-emp-text, #111827)" }}>{profile.companyName}</div>
      <div style={{ marginTop: 4, fontSize: 11, fontFamily: "monospace", color: "var(--wm-emp-muted, #6b7280)", letterSpacing: 0.3 }}>
        {profile.wmId}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: has ? "#f59e0b" : "var(--wm-emp-muted, #94a3b8)" }}>
          ★ {has ? profile.averageStars.toFixed(1) : "—"}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: lb, color: lc }}>
          {profile.levelLabel}
        </span>
        <span style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)" }}>
          {profile.totalRatings} {profile.totalRatings === 1 ? "rating" : "ratings"}
        </span>
      </div>
    </div>
  );
}

/* ── StatsCard ─────────────────────────────────── */

export function StatsCard({ profile }: { profile: EmployerPublicProfile }) {
  const rows: { label: string; value: string }[] = [
    { label: "Total shifts posted", value: String(profile.totalShiftPosts) },
    { label: "Total career jobs", value: String(profile.totalCareerPosts) },
    { label: "Workers hired", value: String(profile.totalWorkersHired) },
    { label: "Active job posts", value: String(profile.activeJobPosts) },
  ];
  if (profile.memberSince) rows.push({ label: "Member since", value: fmtDate(profile.memberSince) });
  if (profile.industryType) rows.push({ label: "Industry", value: profile.industryType });
  return (
    <div className="wm-ee-card" style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-emp-text, #111827)", marginBottom: 8 }}>Activity</div>
      <div style={{ display: "grid", gap: 6 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
            <span style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)" }}>{r.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-text, #111827)" }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── TagsCard ──────────────────────────────────── */

export function TagsCard({ profile }: { profile: EmployerPublicProfile }) {
  const entries = Object.entries(profile.tagCounts).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  return (
    <div className="wm-ee-card" style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-emp-text, #111827)", marginBottom: 8 }}>What workers say</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {entries.map(([tag, count]) => (
          <span key={tag} style={{
            fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 12,
            background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)",
            color: "var(--wm-er-accent-hr, #7c3aed)",
          }}>
            {tag} ({count})
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── ReviewsCard ───────────────────────────────── */

export function ReviewsCard({ reviews }: { reviews: EmployerReview[] }) {
  const visible = reviews.filter((r) => r.comment).slice(0, 10);
  if (visible.length === 0) return null;
  return (
    <div className="wm-ee-card" style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-emp-text, #111827)", marginBottom: 8 }}>
        Worker reviews ({visible.length})
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {visible.map((r) => (
          <div key={r.id} style={{
            padding: "10px 12px", borderRadius: 10,
            border: "1px solid var(--wm-emp-border, rgba(15,23,42,0.08))", background: "rgba(17,24,39,0.02)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#f59e0b", letterSpacing: 1 }}>{starString(r.stars)}</span>
              <span style={{ fontSize: 10, color: "var(--wm-emp-muted, #6b7280)" }}>{fmtRelative(r.createdAt)}</span>
            </div>
            {r.comment && (
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-emp-text, #111827)", lineHeight: 1.5 }}>{r.comment}</div>
            )}
            <div style={{ marginTop: 4, fontSize: 10, color: "var(--wm-emp-muted, #6b7280)" }}>
              {r.workAgain ? "Would work again ✓" : "Would not work again"}
              {r.domain === "career" ? " · Career" : " · Shift"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}