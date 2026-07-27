// App name: Job Mitra
// File name: CareerCreateInterviewSetup.tsx

import type { CSSProperties } from "react";
import { interviewModeLabel } from "../helpers/careerCreateStepInterview.helpers";
import type { InterviewMode, InterviewRoundConfig } from "../types/careerTypes";
import {
  CareerCreateStepSectionHead,
  IconAdd,
  IconInterview,
  IconRemove,
} from "./CareerCreateStepSectionHead";

const PREMIUM_CARD_STYLE: CSSProperties = {
  padding: 20,
  borderRadius: "var(--wm-radius-employer-card)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.6))",
  boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1)",
  backdropFilter: "blur(24px)",
};
const PREMIUM_INPUT_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: "var(--wm-radius-chip)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "rgba(255, 255, 255, 0.8)",
  padding: "0 14px",
  color: "var(--wm-er-text)",
  fontSize: 13.5,
  fontWeight: 600,
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
  outline: "none",
  transition: "all var(--wm-motion-fast) var(--wm-motion-spring)",
};

export function CareerCreateInterviewSetup({
  rounds,
  onChange,
}: {
  rounds: InterviewRoundConfig[];
  onChange: (rounds: InterviewRoundConfig[]) => void;
}) {
  function addRound() {
    if (rounds.length >= 10) return;
    onChange([
      ...rounds,
      { round: rounds.length + 1, label: `Round ${rounds.length + 1}`, mode: "in-person" },
    ]);
  }
  function removeLastRound() {
    if (rounds.length <= 1) return;
    onChange(rounds.slice(0, -1));
  }
  function updateRound(index: number, updates: Partial<InterviewRoundConfig>) {
    onChange(rounds.map((r, i) => (i === index ? { ...r, ...updates } : r)));
  }

  return (
    <section style={PREMIUM_CARD_STYLE}>
      <CareerCreateStepSectionHead
        icon={<IconInterview />}
        title="Interview Setup"
        sub="Configure interview rounds"
      />
      {rounds.map((round, index) => (
        <div
          key={round.round}
          style={{
            padding: 16,
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(0,0,0,0.03)",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "var(--wm-er-accent-career)",
              marginBottom: 10,
            }}
          >
            ROUND {round.round}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, display: "block" }}>
                Name
              </label>
              <input
                style={PREMIUM_INPUT_STYLE}
                value={round.label}
                onChange={(e) => updateRound(index, { label: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, display: "block" }}>
                Mode
              </label>
              <select
                style={PREMIUM_INPUT_STYLE}
                value={round.mode}
                onChange={(e) => updateRound(index, { mode: e.target.value as InterviewMode })}
              >
                {["in-person", "phone", "video"].map((m) => (
                  <option key={m} value={m}>
                    {interviewModeLabel(m as InterviewMode)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button
          type="button"
          onClick={addRound}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--wm-radius-button)",
            border: "none",
            background: "var(--wm-er-accent-career)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          <IconAdd /> Add
        </button>
        <button
          type="button"
          onClick={removeLastRound}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--wm-radius-button)",
            border: "1px solid #e2e8f0",
            background: "#fff",
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          <IconRemove /> Remove
        </button>
      </div>
    </section>
  );
}
