// src/features/employer/shiftJobs/pages/EmployerCandidateDetailPage.tsx
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getAppsSnapshot } from "../helpers/dashboardHelpers";
import { getPostsSnapshot } from "../helpers/dashboardHelpers";

type AnswerState = "meets" | "not_sure" | "dont_meet";

function fmtDateTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

function expLabel(x: string): string {
  if (x === "1-3") return "1-3 years";
  if (x === "3-5") return "3-5 years";
  if (x === "5+") return "5+ years";
  if (x === "fresher") return "Fresher";
  return x;
}

function AnswerBadge({ answer }: { answer: AnswerState | undefined }) {
  if (!answer) return <span style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>No answer</span>;
  const map: Record<AnswerState, { label: string; bg: string; color: string }> = {
    meets:      { label: "Meets",      bg: "rgba(22,163,74,0.10)",  color: "#16a34a" },
    not_sure:   { label: "Not sure",   bg: "rgba(217,119,6,0.10)",  color: "#d97706" },
    dont_meet:  { label: "Don't meet", bg: "rgba(220,38,38,0.10)",  color: "#dc2626" },
  };
  const s = map[answer];
  return (
    <span style={{
      fontSize: 11, fontWeight: 900, padding: "3px 10px",
      borderRadius: 999, background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

function ScoreBar({ mustHaveAnswers, goodToHaveAnswers, mustHave, goodToHave }: {
  mustHaveAnswers: Record<string, AnswerState>;
  goodToHaveAnswers: Record<string, AnswerState>;
  mustHave: string[];
  goodToHave: string[];
}) {
  const mustTotal = mustHave.length;
  const mustMet = mustHave.filter((x) => mustHaveAnswers[x] === "meets").length;
  const goodTotal = goodToHave.length;
  const goodMet = goodToHave.filter((x) => goodToHaveAnswers[x] === "meets").length;

  if (mustTotal === 0 && goodTotal === 0) return null;

  const totalScore = mustTotal + goodTotal;
  const totalMet = mustMet + goodMet;
  const pct = totalScore > 0 ? Math.round((totalMet / totalScore) * 100) : 100;
  const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";

  return (
    <div style={{
      padding: "14px 16px",
      borderRadius: 14,
      background: "var(--wm-er-surface)",
      border: "1px solid var(--wm-er-border)",
      marginTop: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: "var(--wm-er-text)" }}>Match Score</div>
        <div style={{ fontSize: 20, fontWeight: 1000, color }}>{pct}%</div>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "var(--wm-er-divider)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.4s" }} />
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        {mustTotal > 0 && (
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
            Must-have: <b style={{ color: mustMet === mustTotal ? "#16a34a" : "#dc2626" }}>{mustMet}/{mustTotal}</b>
          </div>
        )}
        {goodTotal > 0 && (
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
            Good-to-have: <b style={{ color: "#0f766e" }}>{goodMet}/{goodTotal}</b>
          </div>
        )}
      </div>
    </div>
  );
}

export function EmployerCandidateDetailPage() {
  const { postId = "", appId = "" } = useParams();

  const app = useMemo(() => {
    const all = getAppsSnapshot();
    return all.find((a) => a.id === appId && a.postId === postId) ?? null;
  }, [postId, appId]);

  const post = useMemo(() => {
    const all = getPostsSnapshot();
    return all.find((p) => p.id === postId) ?? null;
  }, [postId]);

  const mustHave: string[] = useMemo(() => {
    if (!post) return [];
    return Array.isArray(post.mustHave) ? post.mustHave.filter((x: string) => typeof x === "string" && x.trim()) : [];
  }, [post]);

  const goodToHave: string[] = useMemo(() => {
    if (!post) return [];
    return Array.isArray(post.goodToHave) ? post.goodToHave.filter((x: string) => typeof x === "string" && x.trim()) : [];
  }, [post]);

  if (!app) {
    return (
      <div>
        <div className="wm-pageHead">
          <div>
            <div className="wm-pageTitle">Candidate</div>
            <div className="wm-pageSub">Application not found.</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }} className="wm-ee-card">
          <div style={{ fontWeight: 1000 }}>This application is not available.</div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button className="wm-outlineBtn" type="button" onClick={() => window.history.back()}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  const snap = app.profileSnapshot;
  const displayId = snap?.uniqueId ?? `Candidate ${app.id.slice(-6).toUpperCase()}`;
  const statusColors: Record<string, string> = {
    applied: "#0f766e", shortlisted: "#16a34a", waiting: "#d97706",
    confirmed: "#0284c7", rejected: "#dc2626", withdrawn: "#6b7280",
    replaced: "#9333ea", exited: "#6b7280",
  };
  const statusColor = statusColors[app.status] ?? "#6b7280";

  return (
    <div>
      {/* Header */}
       <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Candidate Detail</div>
          <div className="wm-pageSub">
            {post ? `${post.jobName} - ${post.companyName}` : "Shift Job"}
          </div>
        </div>
      </div>

      {/* Unique ID card */}
      <div style={{
        marginTop: 12,
        padding: "16px",
        borderRadius: 14,
        background: "rgba(15,118,110,0.06)",
        border: "1px solid rgba(15,118,110,0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "var(--wm-er-muted)", letterSpacing: 0.5 }}>CANDIDATE ID</div>
          <div style={{ fontSize: 26, fontWeight: 1000, color: "var(--wm-er-accent-shift)", letterSpacing: 2, marginTop: 2 }}>
            {displayId}
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 4 }}>
            Applied: {fmtDateTime(app.createdAt)}
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 900, padding: "4px 12px",
          borderRadius: 999, background: `${statusColor}18`, color: statusColor,
          border: `1px solid ${statusColor}33`, whiteSpace: "nowrap",
          textTransform: "capitalize",
        }}>
          {app.status}
        </span>
      </div>

      {/* Match score */}
      {post && (
        <ScoreBar
          mustHaveAnswers={app.mustHaveAnswers}
          goodToHaveAnswers={app.goodToHaveAnswers}
          mustHave={mustHave}
          goodToHave={goodToHave}
        />
      )}

      {/* Profile snapshot */}
      {snap && (snap.fullName || snap.city || snap.experience || snap.skills?.length || snap.languages?.length) ? (
        <div style={{ marginTop: 12 }} className="wm-ee-card">
          <div style={{ fontWeight: 1000, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 12 }}>Profile</div>

          <div style={{ display: "grid", gap: 8 }}>
            {snap.fullName && (
              <div className="wm-kv">
                <div className="k">Name</div>
                <div className="v" style={{ fontWeight: 800 }}>{snap.fullName}</div>
              </div>
            )}
            {snap.city && (
              <div className="wm-kv">
                <div className="k">City</div>
                <div className="v">📍 {snap.city}</div>
              </div>
            )}
            {snap.experience && (
              <div className="wm-kv">
                <div className="k">Experience</div>
                <div className="v">⭐ {expLabel(snap.experience)}</div>
              </div>
            )}
          </div>

          {snap.skills && snap.skills.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "var(--wm-er-muted)", marginBottom: 6 }}>SKILLS</div>
              <div className="wm-chipRow">
                {snap.skills.slice(0, 8).map((s) => (
                  <span key={s} style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px",
                    borderRadius: 999, background: "rgba(15,118,110,0.10)",
                    color: "var(--wm-er-accent-shift)", border: "1px solid rgba(15,118,110,0.18)",
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {snap.languages && snap.languages.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "var(--wm-er-muted)", marginBottom: 6 }}>LANGUAGES</div>
              <div className="wm-chipRow">
                {snap.languages.map((l) => (
                  <span key={l} style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px",
                    borderRadius: 999, background: "rgba(2,132,199,0.08)",
                    color: "#0284c7", border: "1px solid rgba(2,132,199,0.18)",
                  }}>🗣 {l}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 12 }} className="wm-ee-card">
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
            No profile information provided by candidate.
          </div>
        </div>
      )}

      {/* Must-have answers */}
      <div style={{ marginTop: 12 }} className="wm-ee-card">
        <div style={{ fontWeight: 1000, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 10 }}>
          Minimum Requirements
        </div>
        {mustHave.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>No minimum requirements were set for this post.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {mustHave.map((item) => {
              const answer = app.mustHaveAnswers[item] as AnswerState | undefined;
              const note = app.notes?.[item];
              return (
                <div key={item} style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: "var(--wm-er-surface)",
                  border: "1px solid var(--wm-er-border)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)" }}>{item}</div>
                    <AnswerBadge answer={answer} />
                  </div>
                  {note && (
                    <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
                      "{note}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Good-to-have answers */}
      <div style={{ marginTop: 12, marginBottom: 24 }} className="wm-ee-card">
        <div style={{ fontWeight: 1000, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 10 }}>
          Good to Have
        </div>
        {goodToHave.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>No optional requirements were set for this post.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {goodToHave.map((item) => {
              const answer = app.goodToHaveAnswers[item] as AnswerState | undefined;
              const note = app.notes?.[item];
              return (
                <div key={item} style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: "var(--wm-er-surface)",
                  border: "1px solid var(--wm-er-border)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)" }}>{item}</div>
                    <AnswerBadge answer={answer} />
                  </div>
                  {note && (
                    <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
                      "{note}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}