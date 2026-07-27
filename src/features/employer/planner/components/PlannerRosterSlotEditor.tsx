/** Job Mitra | PlannerRosterSlotEditor.tsx | Inline post-publish slot edit */

import { useState } from "react";
import type { DemandPlan } from "../storage/demandPlannerStorage";
import { editPlanSlot } from "../services/plannerSlotEdit.service";
import { fmtPlanDate } from "../helpers/plannerDateFormat.helpers";

type Props = {
  plan: DemandPlan;
  onSaved?: () => void;
};

export function PlannerRosterSlotEditor({ plan, onSaved }: Props) {
  const [drafts, setDrafts] = useState<
    Record<string, { workers: string; payPerDay: string; category: string }>
  >({});
  const [msg, setMsg] = useState("");

  function draftFor(slotKey: string, workers: number, pay: number, category?: string) {
    return (
      drafts[slotKey] ?? {
        workers: String(workers),
        payPerDay: String(pay),
        category: category ?? "",
      }
    );
  }

  function save(slotKey: string, dateLabel: string) {
    const d = drafts[slotKey];
    if (!d) return;
    const result = editPlanSlot(plan.id, slotKey, {
      workers: Number(d.workers),
      payPerDay: Number(d.payPerDay),
      category: d.category,
    });
    if (!result.ok) {
      setMsg(`Could not save ${dateLabel}: ${result.reason}`);
      return;
    }
    setMsg(result.softWarn ? `${dateLabel}: saved. ${result.softWarn}` : `${dateLabel}: saved.`);
    onSaved?.();
  }

  return (
    <section className="wm-planner-card" data-testid="planner-roster-slot-editor">
      <div className="wm-planner-sectionLabel">Slot edit</div>
      <div className="wm-planner-sectionTitle" style={{ fontSize: 15 }}>
        Workers / pay / category (post-publish)
      </div>
      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {plan.slots.map((slot) => {
          const key = slot.slotId ?? slot.date;
          const d = draftFor(key, slot.workers, slot.payPerDay, slot.category);
          return (
            <div
              key={key}
              data-testid="planner-slot-edit-row"
              style={{
                display: "grid",
                gap: 6,
                padding: 10,
                borderRadius: 12,
                border: "1px solid rgba(226,232,240,0.95)",
                background: "#fff",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800 }}>{fmtPlanDate(slot.date)}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <label style={{ fontSize: 11 }}>
                  Workers
                  <input
                    className="wm-input"
                    type="number"
                    min={0}
                    value={d.workers}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [key]: { ...d, workers: e.target.value },
                      }))
                    }
                    style={{ width: 72, display: "block", marginTop: 2 }}
                  />
                </label>
                <label style={{ fontSize: 11 }}>
                  Pay / day
                  <input
                    className="wm-input"
                    type="number"
                    min={0}
                    value={d.payPerDay}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [key]: { ...d, payPerDay: e.target.value },
                      }))
                    }
                    style={{ width: 96, display: "block", marginTop: 2 }}
                  />
                </label>
                <label style={{ fontSize: 11, flex: 1, minWidth: 120 }}>
                  Category / role
                  <input
                    className="wm-input"
                    value={d.category}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [key]: { ...d, category: e.target.value },
                      }))
                    }
                    style={{ width: "100%", display: "block", marginTop: 2 }}
                  />
                </label>
                <button
                  type="button"
                  className="wm-planner-btnPrimary"
                  data-testid="planner-slot-edit-save"
                  style={{ alignSelf: "end" }}
                  onClick={() => save(key, fmtPlanDate(slot.date))}
                >
                  Save
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {msg ? (
        <p role="status" style={{ fontSize: 12, marginTop: 8, fontWeight: 700, color: "#0e7490" }}>
          {msg}
        </p>
      ) : null}
    </section>
  );
}
