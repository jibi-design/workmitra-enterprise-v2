import { useMemo, useState } from "react";
import { ExportImportSection } from "../../../../shared/components/ExportImportSection";
import { roleStorage } from "../../../../app/storage/roleStorage";

import { employeeSettingsStorage, type EmployeeSettings } from "../storage/employeeSettings.storage";

type NoticeTone = "info" | "warn";
type CenterNotice = { title: string; message: string; tone: NoticeTone } | null;

type ConfirmState = {
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
} | null;

function isLanguage(x: string): x is EmployeeSettings["language"] {
  // English-only rule
  return x === "en";
}

function isHomeTab(x: string): x is EmployeeSettings["defaultHomeTab"] {
  return x === "home" || x === "jobs" || x === "alerts";
}

export function EmployeeSettingsPage() {
  const initial = useMemo(() => employeeSettingsStorage.get(), []);
  const [s, setS] = useState<EmployeeSettings>(initial);

  const [notice, setNotice] = useState<CenterNotice>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  function openNotice(title: string, message: string, tone: NoticeTone = "info") {
    setNotice({ title, message, tone });
  }

  function closeNotice() {
    setNotice(null);
  }

  function openConfirm(next: ConfirmState) {
    setConfirm(next);
  }

  function closeConfirm() {
    setConfirm(null);
  }

  function runConfirmAction() {
    if (!confirm) return;
    try {
      confirm.onConfirm();
    } finally {
      setConfirm(null);
    }
  }

  function save(next: EmployeeSettings) {
    // enforce English-only
    const safeNext: EmployeeSettings = { ...next, language: "en" };
    employeeSettingsStorage.set(safeNext);
    setS(safeNext);
  }

  function toggle<K extends keyof EmployeeSettings>(key: K) {
    save({ ...s, [key]: !s[key] });
  }

  function clearLocalData() {
    openConfirm({
      title: "Clear local demo data?",
      message: "This will reset your profile, settings, notifications, and demo counters on this device.",
      confirmText: "Clear local data",
      danger: true,
      onConfirm: () => {
        // Employee demo keys (Phase-0)
        localStorage.removeItem("wm_employee_home_demo_v1");
        localStorage.removeItem("wm_employee_profile_v1");
        localStorage.removeItem("wm_employee_notifications_v1");
        localStorage.removeItem("wm_employee_settings_v1");

        openNotice("Cleared", "Local demo data cleared. The app will reload now.", "info");
        window.setTimeout(() => window.location.reload(), 450);
      },
    });
  }

  function logout() {
    openConfirm({
      title: "Logout from this device?",
      message: "You will return to role selection. Any unsaved changes will be lost.",
      confirmText: "Logout",
      danger: false,
      onConfirm: () => {
        roleStorage.clear();
        window.location.href = "/";
      },
    });
  }

  function deleteAccount() {
    openConfirm({
      title: "Delete your account?",
      message: "This will permanently remove ALL your data — profile, ratings, work history, documents, everything. This cannot be undone.",
      confirmText: "Delete everything",
      danger: true,
      onConfirm: () => {
        localStorage.clear();
        roleStorage.clear();
        window.location.href = "/";
      },
    });
  }

  return (
    <div>
      {/* Notice modal */}
      {notice ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Notice"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 60,
          }}
          onClick={closeNotice}
        >
          <div
            className="wm-ee-card"
            style={{
              width: "100%",
              maxWidth: 460,
              margin: 0,
              borderColor: notice.tone === "warn" ? "rgba(217,119,6,0.22)" : "rgba(15,118,110,0.22)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 1000, fontSize: 14, color: "var(--wm-er-text)" }}>{notice.title}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)" }}>{notice.message}</div>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <button className="wm-outlineBtn" type="button" onClick={closeNotice}>
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirm modal */}
      {confirm ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmation"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 61,
          }}
          onClick={closeConfirm}
        >
          <div className="wm-ee-card" style={{ width: "100%", maxWidth: 520, margin: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 1000, fontSize: 14, color: "var(--wm-er-text)" }}>{confirm.title}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)" }}>{confirm.message}</div>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="wm-outlineBtn" type="button" onClick={closeConfirm}>
                Cancel
              </button>
              <button className={confirm.danger ? "wm-dangerBtn" : "wm-primarybtn"} type="button" onClick={runConfirmAction}>
                {confirm.confirmText ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Settings</div>
          <div className="wm-pageSub">How the app behaves. Profile fields are not here.</div>
        </div>
      </div>

      <section className="wm-ee-card" style={{ marginTop: 12 }}>
        <div className="wm-ee-cardTitle">Preferences</div>

        <div className="wm-field" style={{ marginTop: 8 }}>
          <label className="wm-label">Language</label>
          <select
            className="wm-input"
            value={"en"}
            onChange={(e) => {
              const v = e.target.value;
              if (!isLanguage(v)) return;
              save({ ...s, language: v });
            }}
            aria-disabled="true"
            disabled
            title="English only (locked)"
          >
            <option value="en">English (locked)</option>
          </select>
          <div className="wm-ee-helperText">English-only is locked for global publishing.</div>
        </div>

        <div className="wm-field">
          <label className="wm-label">Theme</label>
          <input className="wm-input" value="Light (locked)" disabled aria-disabled="true" />
          <div className="wm-ee-helperText">Theme is locked to Light for now (Phase-0).</div>
        </div>

        <div className="wm-toggleRow" style={{ marginTop: 10 }}>
          <label className="wm-toggle">
            <input type="checkbox" checked={s.quickApplyEnabled} onChange={() => toggle("quickApplyEnabled")} />
            <span>Quick Apply</span>
          </label>
        </div>
        <div className="wm-ee-helperText" style={{ marginTop: 4 }}>
          Apply to shifts with one tap using your saved profile. Complete your profile first to use this feature.
        </div>

        <div className="wm-field" style={{ marginTop: 10 }}>
          <label className="wm-label">Default home tab</label>
          <select
            className="wm-input"
            value={s.defaultHomeTab}
            onChange={(e) => {
              const v = e.target.value;
              if (!isHomeTab(v)) return;
              save({ ...s, defaultHomeTab: v });
            }}
          >
            <option value="home">Home</option>
            <option value="jobs">My Jobs</option>
            <option value="alerts">Alerts</option>
          </select>
        </div>
      </section>

      <section className="wm-ee-card" style={{ marginTop: 12 }}>
        <div className="wm-ee-cardTitle">Notifications</div>

        <div className="wm-toggleRow" style={{ marginTop: 8 }}>
          <label className="wm-toggle">
            <input type="checkbox" checked={s.pushEnabled} onChange={() => toggle("pushEnabled")} />
            <span>Push notifications (demo)</span>
          </label>
        </div>

        <div className="wm-ee-helperText" style={{ marginTop: 6 }}>
          Domain toggles (never mix counts/details across domains).
        </div>

        <div className="wm-toggleRow" style={{ marginTop: 10 }}>
          <label className="wm-toggle">
            <input type="checkbox" checked={s.shiftAlerts} onChange={() => toggle("shiftAlerts")} />
            <span>Shift alerts</span>
          </label>
          <label className="wm-toggle">
            <input type="checkbox" checked={s.careerAlerts} onChange={() => toggle("careerAlerts")} />
            <span>Career alerts</span>
          </label>
          <label className="wm-toggle">
            <input type="checkbox" checked={s.workforceAlerts} onChange={() => toggle("workforceAlerts")} />
            <span>Workforce alerts</span>
          </label>
        </div>

        <div className="wm-field" style={{ marginTop: 10 }}>
          <label className="wm-label">Quiet hours (Do not disturb)</label>
          <label className="wm-toggle" style={{ marginTop: 6 }}>
            <input type="checkbox" checked={s.quietHoursEnabled} onChange={() => toggle("quietHoursEnabled")} />
            <span>Enable</span>
          </label>

          <div className="wm-grid2" style={{ marginTop: 10 }}>
            <div>
              <label className="wm-label">From</label>
              <input
                className="wm-input"
                type="time"
                value={s.quietFrom}
                onChange={(e) => save({ ...s, quietFrom: e.target.value })}
                disabled={!s.quietHoursEnabled}
                aria-disabled={!s.quietHoursEnabled}
              />
            </div>
            <div>
              <label className="wm-label">To</label>
              <input
                className="wm-input"
                type="time"
                value={s.quietTo}
                onChange={(e) => save({ ...s, quietTo: e.target.value })}
                disabled={!s.quietHoursEnabled}
                aria-disabled={!s.quietHoursEnabled}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="wm-ee-card" style={{ marginTop: 12 }}>
        <div className="wm-ee-cardTitle">Privacy & security</div>

        <div className="wm-toggleRow" style={{ marginTop: 8 }}>
          <label className="wm-toggle">
            <input type="checkbox" checked={s.appLockEnabled} onChange={() => toggle("appLockEnabled")} />
            <span>App lock (PIN) (demo toggle)</span>
          </label>
        </div>

        {/* Polished actions: Logout is danger; clear local data is secondary */}
        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button className="wm-outlineBtn" type="button" onClick={clearLocalData} style={{ minWidth: 160, justifyContent: "center" }}>
            Clear local data
          </button>
          <button className="wm-dangerBtn" type="button" onClick={deleteAccount} style={{ minWidth: 120, justifyContent: "center" }}>
            Delete account
          </button>
          <button className="wm-outlineBtn" type="button" onClick={logout} style={{ minWidth: 120, justifyContent: "center" }}>
            Logout
          </button>
        </div>

        <div className="wm-ee-helperText" style={{ marginTop: 10 }}>
          Device/session list is Phase-1 (real). Phase-0 shows only this device.
        </div>
      </section>

      <section className="wm-ee-card" style={{ marginTop: 12 }}>
        <div className="wm-ee-cardTitle">Help & legal</div>
        <div className="wm-linkList" style={{ marginTop: 8 }}>
          <button className="wm-ee-linkBtn" type="button" onClick={() => { window.location.hash = "#/employee/help"; }}>
            Help & Support →
          </button>
          <button className="wm-ee-linkBtn" type="button" onClick={() => window.open("https://jibi-design.github.io/workmitra-privacy/", "_blank")}>
            Privacy Policy →
          </button>
        </div>
      </section>

      <ExportImportSection />

      <section className="wm-ee-card" style={{ marginTop: 12 }}>
        <div className="wm-ee-cardTitle">About</div>
        <div className="wm-kv" style={{ marginTop: 8 }}>
          <div className="k">App version</div>
          <div className="v">0.0.0</div>
        </div>
        <div className="wm-kv">
          <div className="k">Build</div>
          <div className="v">Demo</div>
        </div>
      </section>
    </div>
  );
}