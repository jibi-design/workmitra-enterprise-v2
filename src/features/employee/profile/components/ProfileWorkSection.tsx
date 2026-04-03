// src/features/employee/profile/components/ProfileWorkSection.tsx

import { useState } from "react";
import type { ExperienceLevel } from "../storage/employeeProfile.storage";
import type { ProfileSectionProps } from "../types/profileTypes";
import { clampString, uniqueLower } from "../helpers/profileHelpers";
import { SectionHead, IconWork } from "./ProfilePageIcons";

const chipStyle: React.CSSProperties = {
  height: 28, borderRadius: 999, padding: "0 10px", display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 12, fontWeight: 700, background: "rgba(29, 78, 216, 0.06)", border: "1px solid rgba(29, 78, 216, 0.18)", color: "var(--wm-emp-text)",
};

const chipRemoveStyle: React.CSSProperties = {
  border: 0, background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 900, color: "var(--wm-emp-muted)", padding: 0, lineHeight: 1,
};

type Props = ProfileSectionProps & {
  sectionRef: React.RefObject<HTMLElement | null>;
};

export function ProfileWorkSection({ draft, disabled, onUpdate, sectionRef }: Props) {
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  function addSkill(raw: string): void {
    const s = clampString(raw, 24);
    if (!s) return;
    onUpdate("skills", uniqueLower([...draft.skills, s]));
    setSkillInput("");
  }

  function removeSkill(s: string): void {
    onUpdate("skills", draft.skills.filter((x) => x.toLowerCase() !== s.toLowerCase()));
  }

  function addLanguage(raw: string): void {
    const lang = clampString(raw, 24);
    if (!lang) return;
    onUpdate("languages", uniqueLower([...draft.languages, lang]));
    setLanguageInput("");
  }

  function removeLanguage(lang: string): void {
    onUpdate("languages", draft.languages.filter((x) => x.toLowerCase() !== lang.toLowerCase()));
  }

  return (
    <section className="wm-ee-card" style={{ marginTop: 12 }} ref={sectionRef}>
      <SectionHead icon={<IconWork />} title="Work Profile" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="wm-field">
          <label className="wm-label">Experience level <span style={{ color: "var(--wm-error)" }}>*</span></label>
          <select className="wm-input" value={draft.experience} disabled={disabled}
            onChange={(e) => onUpdate("experience", e.target.value as ExperienceLevel)}>
            <option value="fresher">Fresher</option>
            <option value="1-3">1 to 3 years</option>
            <option value="3-7">3 to 7 years</option>
            <option value="7+">7+ years</option>
          </select>
        </div>

        <div className="wm-field">
          <label className="wm-label">Preferred job types <span style={{ color: "var(--wm-error)" }}>*</span></label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--wm-emp-text)", cursor: disabled ? "default" : "pointer" }}>
              <input type="checkbox" checked={draft.preferShiftJobs} disabled={disabled}
                onChange={(e) => onUpdate("preferShiftJobs", e.target.checked)} /> Shift Jobs
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--wm-emp-text)", cursor: disabled ? "default" : "pointer" }}>
              <input type="checkbox" checked={draft.preferCareerJobs} disabled={disabled}
                onChange={(e) => onUpdate("preferCareerJobs", e.target.checked)} /> Career Jobs
            </label>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="wm-field" style={{ marginTop: 12 }}>
        <label className="wm-label">Skills <span style={{ color: "var(--wm-error)" }}>*</span></label>
        {!disabled && (
          <div style={{ display: "flex", gap: 8 }}>
            <input className="wm-input" style={{ flex: 1 }} value={skillInput} placeholder="Enter a skill"
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }} />
            <button className="wm-primarybtn" type="button" onClick={() => addSkill(skillInput)}>Add</button>
          </div>
        )}
        {draft.skills.length > 0 ? (
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {draft.skills.map((s) => (
              <span key={s} style={chipStyle}>
                {s}
                {!disabled && (
                  <button type="button" style={chipRemoveStyle} onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}>{"\u00D7"}</button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-emp-muted)" }}>
            Add at least one skill to improve matching.
            {disabled && <button type="button" style={{ border: 0, background: "transparent", color: "var(--wm-brand-600)", fontWeight: 700, fontSize: 11, cursor: "pointer", padding: 0, marginLeft: 4 }}>Tap Edit to add →</button>}
          </div>
        )}
      </div>

      {/* Languages */}
      <div className="wm-field" style={{ marginTop: 12 }}>
        <label className="wm-label">Languages <span style={{ color: "var(--wm-error)" }}>*</span></label>
        {!disabled && (
          <div style={{ display: "flex", gap: 8 }}>
            <input className="wm-input" style={{ flex: 1 }} value={languageInput} placeholder="Enter a language"
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLanguage(languageInput); } }} />
            <button className="wm-primarybtn" type="button" onClick={() => addLanguage(languageInput)}>Add</button>
          </div>
        )}
        {draft.languages.length > 0 ? (
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {draft.languages.map((lang) => (
              <span key={lang} style={chipStyle}>
                {lang}
                {!disabled && (
                  <button type="button" style={chipRemoveStyle} onClick={() => removeLanguage(lang)} aria-label={`Remove ${lang}`}>{"\u00D7"}</button>
                )}
              </span>
            ))}
          </div>
        ) : (
           <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-emp-muted)" }}>
            Add at least one language for better matching.
            {disabled && <button type="button" style={{ border: 0, background: "transparent", color: "var(--wm-brand-600)", fontWeight: 700, fontSize: 11, cursor: "pointer", padding: 0, marginLeft: 4 }}>Tap Edit to add →</button>}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="wm-field" style={{ marginTop: 12 }}>
        <label className="wm-label">Availability (for shifts) <span style={{ color: "var(--wm-error)" }}>*</span></label>
        <div style={{ fontSize: 11, color: "var(--wm-emp-muted)", marginBottom: 8 }}>Pick at least one day and one time.</div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)", marginBottom: 6 }}>Days</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(["weekdays", "weekends"] as const).map((key) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--wm-emp-text)", cursor: disabled ? "default" : "pointer" }}>
              <input type="checkbox" checked={draft.availability[key]} disabled={disabled}
                onChange={(e) => onUpdate("availability", { ...draft.availability, [key]: e.target.checked })} />
              {key === "weekdays" ? "Weekdays" : "Weekends"}
            </label>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted)", marginTop: 10, marginBottom: 6 }}>Time</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(["morning", "afternoon", "evening"] as const).map((key) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--wm-emp-text)", cursor: disabled ? "default" : "pointer" }}>
              <input type="checkbox" checked={draft.availability[key]} disabled={disabled}
                onChange={(e) => onUpdate("availability", { ...draft.availability, [key]: e.target.checked })} />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}