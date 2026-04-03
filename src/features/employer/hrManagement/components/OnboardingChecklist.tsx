// src/features/employer/hrManagement/components/OnboardingChecklist.tsx
//
// Interactive onboarding checklist.
// Employer ticks items, adds custom items, removes custom items.
// Auto-completes when all items are done.

import { useState } from "react";
import type { OnboardingChecklist as OnboardingData } from "../types/hrManagement.types";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { OnboardingAddItemModal } from "./OnboardingAddItemModal";

type Props = {
  recordId: string;
  onboarding: OnboardingData;
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OnboardingChecklistView({ recordId, onboarding }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);

  const total = onboarding.items.length;
  const completed = onboarding.items.filter((i) => i.completedAt).length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = total > 0 && completed === total;

  const handleToggle = (itemId: string) => {
    hrManagementStorage.toggleOnboardingItem(recordId, itemId, "employer");
  };

  const handleRemove = (itemId: string) => {
    hrManagementStorage.removeOnboardingItem(recordId, itemId);
  };

  const handleAddItem = (label: string) => {
    hrManagementStorage.addOnboardingItem(recordId, label);
    setShowAddModal(false);
  };

  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>
            Onboarding Checklist
          </div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
            {completed} of {total} completed
          </div>
        </div>
        {allDone && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(22, 163, 74, 0.08)",
              color: "#16a34a",
              border: "1px solid rgba(22, 163, 74, 0.2)",
            }}
          >
            ✓ Complete
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "var(--wm-er-border, #e5e7eb)",
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            borderRadius: 999,
            background: allDone ? "#16a34a" : "#7c3aed",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {onboarding.items.map((item) => {
          const isDone = !!item.completedAt;

          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 0",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: isDone ? "none" : "2px solid var(--wm-er-border, #d1d5db)",
                  background: isDone ? "#16a34a" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.15s, border 0.15s",
                }}
                aria-label={isDone ? `Uncheck ${item.label}` : `Check ${item.label}`}
              >
                {isDone && (
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
                  </svg>
                )}
              </button>

              {/* Label */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isDone ? "var(--wm-er-muted)" : "var(--wm-er-text)",
                    textDecoration: isDone ? "line-through" : "none",
                  }}
                >
                  {item.label}
                </div>
                {isDone && item.completedAt && (
                  <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 1 }}>
                    Done on {formatDate(item.completedAt)}
                  </div>
                )}
              </div>

              {/* Remove button (custom items only) */}
              {!item.isDefault && (
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#dc2626",
                    fontSize: 16,
                    padding: "2px 4px",
                    flexShrink: 0,
                  }}
                  aria-label={`Remove ${item.label}`}
                  title="Remove custom item"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add custom item */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        style={{
          marginTop: 12,
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          border: "1.5px dashed var(--wm-er-border, #d1d5db)",
          background: "transparent",
          color: "var(--wm-er-muted)",
          fontWeight: 800,
          fontSize: 12,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
        </svg>
        Add Custom Item
      </button>

      {/* Hint */}
      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 10, lineHeight: 1.5 }}>
        Tick each item as the employee completes it. When all items are done, the employee will automatically move to Active status.
      </div>

      {/* Add item modal */}
      <OnboardingAddItemModal
        open={showAddModal}
        onAdd={handleAddItem}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}