// src/features/employer/shiftJobs/components/ShiftCreateProvidesSection.tsx
//
// "What We Provide" section — chip toggles for common provisions.
// Workers see this on the shift detail page before applying.

import { SectionHead } from "./ShiftCreateIcons";

/* ------------------------------------------------ */
/* Provision options                                */
/* ------------------------------------------------ */
type Provision = {
  id: string;
  label: string;
  icon: string;
};

const PROVISIONS: Provision[] = [
  { id: "meals",         label: "Meals provided",       icon: "🍱" },
  { id: "transport",     label: "Transport arranged",   icon: "🚌" },
  { id: "uniform",       label: "Uniform provided",     icon: "👔" },
  { id: "accommodation", label: "Accommodation",        icon: "🏠" },
  { id: "tools",         label: "Tools / Equipment",    icon: "🔧" },
  { id: "ppe",           label: "Safety gear (PPE)",    icon: "🦺" },
  { id: "training",      label: "On-site training",     icon: "📋" },
  { id: "overtime",      label: "Overtime pay",         icon: "💰" },
];

/* ------------------------------------------------ */
/* Icon                                             */
/* ------------------------------------------------ */
function IconProvide() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 6h-2.18c.07-.44.18-.9.18-1.36 0-2.57-2.09-4.64-4.64-4.64C11.8.0 10.58.93 9.9 2.2L8 5H4C2.9 5 2 5.9 2 7v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-4c1.47 0 2.64 1.17 2.64 2.64 0 .56-.17 1.04-.45 1.36H9.09L10.6 3.4C11.05 2.57 11.97 2 13.0 2zm7 18H4V7h16v13z"/>
    </svg>
  );
}

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  selected: string[];
  category?: string;
  onChange: (ids: string[]) => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
const CATEGORY_PROVISIONS: Record<string, string[]> = {
  Construction:   ["meals", "transport", "ppe", "tools", "accommodation"],
  Restaurant:     ["meals", "uniform", "transport", "overtime"],
  Driving:        ["meals", "transport", "overtime", "accommodation"],
  Cleaning:       ["meals", "uniform", "transport", "tools"],
  Events:         ["meals", "uniform", "transport", "accommodation"],
  Retail:         ["meals", "uniform", "transport", "overtime"],
  Warehouse:      ["meals", "transport", "ppe", "tools", "overtime"],
  Security:       ["meals", "uniform", "transport", "accommodation"],
  Agriculture:    ["meals", "transport", "ppe", "tools", "accommodation"],
  Manufacturing:  ["meals", "transport", "ppe", "tools", "overtime"],
  Office:         ["meals", "transport", "training", "overtime"],
  Healthcare:     ["meals", "uniform", "transport", "ppe", "training"],
};

export function ShiftCreateProvidesSection({ selected, category, onChange }: Props) {
  const priorityIds = category ? (CATEGORY_PROVISIONS[category] ?? []) : [];
  const prioritySet = new Set(priorityIds);

  const suggested  = PROVISIONS.filter((p) => prioritySet.has(p.id));
  const additional = PROVISIONS.filter((p) => !prioritySet.has(p.id));
  const showAll    = suggested.length === 0;

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <section className="wm-er-card" style={{ marginTop: 12 }}>
      <SectionHead
        icon={<IconProvide />}
        title="What We Provide"
        sub="Select everything your company provides for this shift."
      />

      {/* Suggested for this category */}
      {!showAll && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)", marginTop: 8, marginBottom: 6 }}>
            Common for {category}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {suggested.map((p) => {
              const isOn = selected.includes(p.id);
              return (
                <button key={p.id} type="button" onClick={() => toggle(p.id)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "7px 12px", borderRadius: 999, cursor: "pointer",
                    fontSize: 12, fontWeight: 600,
                    border: isOn ? "1.5px solid var(--wm-er-accent-shift)" : "1.5px solid var(--wm-er-border)",
                    background: isOn ? "rgba(22,163,74,0.08)" : "var(--wm-er-surface)",
                    color: isOn ? "var(--wm-er-accent-shift)" : "var(--wm-er-muted)",
                    transition: "all 0.15s ease",
                  }}
                  aria-pressed={isOn}
                >
                  <span style={{ fontSize: 15 }}>{p.icon}</span>
                  {p.label}
                  {isOn && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-accent-shift)" }}>&#10003;</span>}
                </button>
              );
            })}
          </div>
          {additional.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)", marginTop: 12, marginBottom: 6 }}>
                Other options
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {additional.map((p) => {
                  const isOn = selected.includes(p.id);
                  return (
                    <button key={p.id} type="button" onClick={() => toggle(p.id)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "7px 12px", borderRadius: 999, cursor: "pointer",
                        fontSize: 12, fontWeight: 600,
                        border: isOn ? "1.5px solid var(--wm-er-accent-shift)" : "1.5px solid var(--wm-er-border)",
                        background: isOn ? "rgba(22,163,74,0.08)" : "var(--wm-er-surface)",
                        color: isOn ? "var(--wm-er-accent-shift)" : "var(--wm-er-muted)",
                        transition: "all 0.15s ease",
                      }}
                      aria-pressed={isOn}
                    >
                      <span style={{ fontSize: 15 }}>{p.icon}</span>
                      {p.label}
                      {isOn && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-accent-shift)" }}>&#10003;</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Fallback: no category match → show all */}
      {showAll && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {PROVISIONS.map((p) => {
            const isOn = selected.includes(p.id);
            return (
              <button key={p.id} type="button" onClick={() => toggle(p.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 999, cursor: "pointer",
                  fontSize: 12, fontWeight: 600,
                  border: isOn ? "1.5px solid var(--wm-er-accent-shift)" : "1.5px solid var(--wm-er-border)",
                  background: isOn ? "rgba(22,163,74,0.08)" : "var(--wm-er-surface)",
                  color: isOn ? "var(--wm-er-accent-shift)" : "var(--wm-er-muted)",
                  transition: "all 0.15s ease",
                }}
                aria-pressed={isOn}
              >
                <span style={{ fontSize: 15 }}>{p.icon}</span>
                {p.label}
                {isOn && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-accent-shift)" }}>&#10003;</span>}
              </button>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--wm-er-muted)" }}>
          {selected.length} item{selected.length !== 1 ? "s" : ""} selected &mdash; workers will see this on the shift details page.
        </div>
      )}
    </section>
  );
}