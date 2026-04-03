// src/features/admin/oversight/pages/AdminAnalyticsPage.tsx
//
// Job Analytics — Shift, Career, and Cross-domain analysis.
// Phase-0: list-based views (no charts). Live localStorage data.
// v5 light premium theme.

import { useSyncExternalStore } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Safe Helpers
// ─────────────────────────────────────────────────────────────────────────────

type Rec = Record<string, unknown>;
function isRec(x: unknown): x is Rec { return typeof x === "object" && x !== null && !Array.isArray(x); }
function safeArr(key: string): unknown[] { try { const r = localStorage.getItem(key); if (!r) return []; const p = JSON.parse(r) as unknown; return Array.isArray(p) ? p : []; } catch { return []; } }
function str(r: Rec, k: string): string { const v = r[k]; return typeof v === "string" ? v : ""; }
function num(r: Rec, k: string): number { const v = r[k]; return typeof v === "number" && Number.isFinite(v) ? v : 0; }

const K = { sp: "wm_employer_shift_posts_v1", sa: "wm_employee_shift_applications_v1", cp: "wm_employer_career_posts_v1", ca: "wm_employee_career_applications_v1", ws: "wm_workforce_staff_v1", wa: "wm_workforce_announcements_v1", wg: "wm_workforce_groups_v1" } as const;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─────────────────────────────────────────────────────────────────────────────
// Compute
// ─────────────────────────────────────────────────────────────────────────────

type D = {
  sTot: number; sAct: number; sDone: number; cats: { n: string; c: number }[];
  avgPay: number; vac: number; conf: number; fill: number; days: { n: string; c: number }[];
  cTot: number; cAct: number; depts: { n: string; c: number }[]; skills: { n: string; c: number }[];
  salMin: number; salMax: number; pipe: { s: string; c: number }[];
  conv: number; tth: number;
   xPosts: number; xApps: number; xHired: number; xConv: number; xShift: number; xCareer: number;
  wfStaff: number; wfOpen: number; wfConfirmed: number; wfCompleted: number; wfAnnTotal: number; wfGroupsActive: number;
};

function compute(): D {
  const sp = safeArr(K.sp); const sa = safeArr(K.sa); const cp = safeArr(K.cp); const ca = safeArr(K.ca);
  let sAct = 0, sDone = 0, tPay = 0, pCnt = 0, vac = 0, conf = 0;
  const catM = new Map<string, number>(); const dayM = new Map<string, number>();
  for (const p of sp) { if (!isRec(p)) continue; const s = str(p, "status"); if (s === "completed") sDone++; else if (s !== "cancelled") sAct++; const c = str(p, "category") || "Other"; catM.set(c, (catM.get(c) ?? 0) + 1); const pay = num(p, "payPerDay"); if (pay > 0) { tPay += pay; pCnt++; } vac += num(p, "vacancies") || 1; if (Array.isArray(p["confirmedIds"])) conf += (p["confirmedIds"] as unknown[]).length; const st = num(p, "startAt"); if (st > 0) { const dn = DAY_NAMES[new Date(st).getDay()]; dayM.set(dn, (dayM.get(dn) ?? 0) + 1); } }

  let cAct = 0, tsMin = 0, tsMax = 0, sCnt = 0;
  const deptM = new Map<string, number>(); const skM = new Map<string, number>();
  for (const p of cp) { if (!isRec(p)) continue; if (str(p, "status") === "active") cAct++; const d = str(p, "department") || "General"; deptM.set(d, (deptM.get(d) ?? 0) + 1); const sk = Array.isArray(p["skills"]) ? p["skills"] as string[] : []; for (const s of sk) { if (typeof s === "string" && s.trim()) skM.set(s.trim(), (skM.get(s.trim()) ?? 0) + 1); } const mn = num(p, "salaryMin"); const mx = num(p, "salaryMax"); if (mn > 0 || mx > 0) { tsMin += mn; tsMax += mx; sCnt++; } }

  let caA = 0, caS = 0, caI = 0, caO = 0, caH = 0, caR = 0, tht = 0, htc = 0;
  for (const a of ca) { if (!isRec(a)) continue; const s = str(a, "stage") || str(a, "status"); if (s === "applied") caA++; else if (s === "shortlisted") caS++; else if (s === "interview") caI++; else if (s === "offered") caO++; else if (s === "hired") { caH++; const at = num(a, "appliedAt"); const ht = num(a, "hiredAt"); if (at > 0 && ht > at) { tht += (ht - at) / 86400000; htc++; } } else if (s === "rejected") caR++; }
  const totCA = caA + caS + caI + caO + caH + caR;

  const wsArr = safeArr(K.ws); const waArr = safeArr(K.wa); const wgArr = safeArr(K.wg);
  let wfStaff = 0; for (const s of wsArr) { if (isRec(s) && str(s, "status") === "active") wfStaff++; }
  let wfOpen = 0; let wfConfirmed = 0; let wfCompleted = 0;
  for (const a of waArr) { if (!isRec(a)) continue; const st = str(a, "status"); if (st === "open") wfOpen++; else if (st === "confirmed") wfConfirmed++; else if (st === "completed") wfCompleted++; }
  let wfGroupsActive = 0; for (const g of wgArr) { if (isRec(g) && str(g, "status") === "active") wfGroupsActive++; }

  const xPosts = sp.length + cp.length; const xApps = sa.length + totCA; const xHired = conf + caH;
  return {
    sTot: sp.length, sAct, sDone, cats: [...catM].map(([n, c]) => ({ n, c })).sort((a, b) => b.c - a.c),
    avgPay: pCnt > 0 ? Math.round(tPay / pCnt) : 0, vac, conf, fill: vac > 0 ? Math.round((conf / vac) * 100) : 0,
    days: [...dayM].map(([n, c]) => ({ n, c })).sort((a, b) => b.c - a.c),
    cTot: cp.length, cAct, depts: [...deptM].map(([n, c]) => ({ n, c })).sort((a, b) => b.c - a.c),
    skills: [...skM].map(([n, c]) => ({ n, c })).sort((a, b) => b.c - a.c).slice(0, 10),
    salMin: sCnt > 0 ? Math.round(tsMin / sCnt) : 0, salMax: sCnt > 0 ? Math.round(tsMax / sCnt) : 0,
    pipe: [{ s: "Applied", c: caA }, { s: "Shortlisted", c: caS }, { s: "Interview", c: caI }, { s: "Offered", c: caO }, { s: "Hired", c: caH }, { s: "Rejected", c: caR }],
    conv: totCA > 0 ? Math.round((caH / totCA) * 100) : 0, tth: htc > 0 ? Math.round(tht / htc) : 0,
    xPosts, xApps, xHired, xConv: xApps > 0 ? Math.round((xHired / xApps) * 100) : 0,
    xShift: xPosts > 0 ? Math.round((sp.length / xPosts) * 100) : 0, xCareer: xPosts > 0 ? Math.round((cp.length / xPosts) * 100) : 0,
    wfStaff, wfOpen, wfConfirmed, wfCompleted, wfAnnTotal: waArr.length, wfGroupsActive,
  };
}

// Reactive
const EVS = ["wm:employer-shift-posts-changed", "wm:employee-shift-applications-changed", "wm:employer-career-posts-changed", "wm:employee-career-applications-changed", "storage", "focus"];
let ck = ""; let cd: D | null = null;
function snap(): D { const k = [localStorage.getItem(K.sp), localStorage.getItem(K.sa), localStorage.getItem(K.cp), localStorage.getItem(K.ca)].join("|"); if (k === ck && cd) return cd; ck = k; cd = compute(); return cd; }
function sub(cb: () => void): () => void { const h = () => cb(); for (const ev of EVS) window.addEventListener(ev, h); document.addEventListener("visibilitychange", h); return () => { for (const ev of EVS) window.removeEventListener(ev, h); document.removeEventListener("visibilitychange", h); }; }

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AdminAnalyticsPage() {
  const d = useSyncExternalStore(sub, snap, snap);
  const hasData = d.xPosts > 0 || d.xApps > 0;

  return (
    <div className="wm-ad-fadeIn">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.6, color: "var(--wm-ad-navy)" }}>Job Analytics</div>
        <div style={{ fontSize: 13, color: "var(--wm-ad-navy-400)", marginTop: 4 }}>Performance insights across all domains</div>
      </div>

      {!hasData ? (
        <div className="wm-ad-empty" style={{ background: "var(--wm-ad-white)", border: "1px solid var(--wm-ad-border)", borderRadius: "var(--wm-ad-r)", boxShadow: "var(--wm-ad-sh)" }}>
          No data yet. Create posts and receive applications to see analytics.
        </div>
      ) : (
        <>
          <Sec label="Cross-Domain Summary" />
          <div className="wm-ad-kpiCard">
            <div className="wm-ad-kpiGrid">
              <KT label="Total Posts" value={d.xPosts} color="var(--wm-ad-navy)" />
              <KT label="Applications" value={d.xApps} color="var(--wm-ad-navy-600)" />
              <KT label="Hired" value={d.xHired} color="var(--wm-ad-green)" />
              <KT label="Conversion" value={`${d.xConv}%`} color="var(--wm-ad-green)" />
              <KT label="Shift Share" value={`${d.xShift}%`} color="var(--wm-ad-shift)" />
              <KT label="Career Share" value={`${d.xCareer}%`} color="var(--wm-ad-career-light)" />
            </div>
          </div>

          {d.sTot > 0 && (<>
            <Sec label="Shift Jobs Analysis" />
            <Crd accent="var(--wm-ad-shift)" title="Shift Overview" tag="TEMPORARY" dim="var(--wm-ad-shift-dim)" brd="var(--wm-ad-shift-border)">
              <Rw l="Total Posts" v={d.sTot} /><Rw l="Active" v={d.sAct} /><Rw l="Completed" v={d.sDone} />
              <Rw l="Vacancies" v={d.vac} /><Rw l="Confirmed" v={d.conf} /><Rw l="Fill Rate" v={`${d.fill}%`} hi={d.fill >= 50} />
              {d.avgPay > 0 && <Rw l="Avg Pay/Day" v={d.avgPay} />}
            </Crd>
            {d.cats.length > 0 && <Crd accent="var(--wm-ad-shift)" title="Popular Categories">{d.cats.map((c) => <Rw key={c.n} l={c.n} v={`${c.c} post${c.c !== 1 ? "s" : ""}`} />)}</Crd>}
            {d.days.length > 0 && <Crd accent="var(--wm-ad-shift)" title="Busiest Days">{d.days.map((x) => <Rw key={x.n} l={x.n} v={`${x.c} shift${x.c !== 1 ? "s" : ""}`} />)}</Crd>}
          </>)}

          {d.cTot > 0 && (<>
            <Sec label="Career Jobs Analysis" />
            <Crd accent="var(--wm-ad-career-light)" title="Career Overview" tag="PERMANENT" dim="var(--wm-ad-career-dim)" brd="var(--wm-ad-career-border)">
              <Rw l="Total Posts" v={d.cTot} /><Rw l="Active" v={d.cAct} />
              {d.salMin > 0 && <Rw l="Avg Salary Range" v={`${d.salMin} — ${d.salMax}`} />}
              <Rw l="Conversion" v={`${d.conv}%`} hi={d.conv > 0} />
              {d.tth > 0 && <Rw l="Avg Time to Hire" v={`${d.tth} days`} />}
            </Crd>
            {d.pipe.some((p) => p.c > 0) && <Crd accent="var(--wm-ad-career-light)" title="Pipeline">{d.pipe.filter((p) => p.c > 0).map((p) => <PR key={p.s} s={p.s} c={p.c} t={d.pipe.reduce((a, x) => a + x.c, 0)} cl="var(--wm-ad-career-light)" />)}</Crd>}
            {d.depts.length > 0 && <Crd accent="var(--wm-ad-career-light)" title="By Department">{d.depts.map((x) => <Rw key={x.n} l={x.n} v={`${x.c} post${x.c !== 1 ? "s" : ""}`} />)}</Crd>}
            {d.skills.length > 0 && <Crd accent="var(--wm-ad-career-light)" title="Top Skills">{d.skills.map((x) => <Rw key={x.n} l={x.n} v={`${x.c}x`} />)}</Crd>}
          </>)}
        </>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

function Sec({ label }: { label: string }) { return <div className="wm-ad-secHead"><span className="wm-ad-secLabel">{label}</span><div className="wm-ad-secLine" /></div>; }

function KT({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (<div className="wm-ad-kpiTile"><div className="wm-ad-kpiValue" style={{ color, fontSize: 26 }}>{value}</div><div className="wm-ad-kpiLabel">{label}</div></div>);
}

function Crd({ accent, title, tag, dim, brd, children }: { accent: string; title: string; tag?: string; dim?: string; brd?: string; children: React.ReactNode }) {
  return (
    <div className="wm-ad-domainCard">
      <div className="wm-ad-domainBar" style={{ background: accent }} />
      <div className="wm-ad-domainHead">
        <div className="wm-ad-domainTitle" style={{ color: accent }}>{title}</div>
        {tag && dim && brd && <div className="wm-ad-domainTag" style={{ background: dim, color: accent, border: `1px solid ${brd}` }}>{tag}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Rw({ l, v, hi }: { l: string; v: number | string; hi?: boolean }) {
  return (<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--wm-ad-divider)" }}><span style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-ad-navy-500)" }}>{l}</span><span style={{ fontSize: 14, fontWeight: 900, color: hi ? "var(--wm-ad-green)" : "var(--wm-ad-navy)", letterSpacing: -0.3 }}>{v}</span></div>);
}

function PR({ s, c, t, cl }: { s: string; c: number; t: number; cl: string }) {
  const pct = t > 0 ? Math.round((c / t) * 100) : 0;
  return (<div style={{ padding: "10px 0", borderTop: "1px solid var(--wm-ad-divider)" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-ad-navy-500)" }}>{s}</span><span style={{ fontSize: 13, fontWeight: 900, color: "var(--wm-ad-navy)" }}>{c} <span style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-ad-navy-300)" }}>({pct}%)</span></span></div><div style={{ height: 4, borderRadius: 2, background: "var(--wm-ad-divider)", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: cl, transition: "width 0.3s" }} /></div></div>);
}