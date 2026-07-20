// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ShiftCreateBasicSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftCreateBasicSection.tsx

import type { CSSProperties } from "react";
import { useState } from "react";
import { SectionHead, IconInfo } from "./ShiftCreateIcons";

const CATEGORIES = [
  "Construction",
  "Kitchen / Restaurant",
  "Catering",
  "Cleaning",
  "Delivery",
  "Driving",
  "Events",
  "Healthcare",
  "Manufacturing",
  "Office",
  "Retail",
  "Security",
  "Warehouse",
  "Agency",
  "Other",
];

type Props = {
  companyName: string;
  onCompanyName: (v: string) => void;
  companyAutoFilled: boolean;
  jobName: string;
  onJobName: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  categoryAutoFilled: boolean;
  description: string;
  onDescription: (v: string) => void;
};

const CARD_STYLE: CSSProperties = {
  marginTop: 12,
  borderRadius: 20,
  border: "1px solid rgba(226,232,240,0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
  boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
};

const FIELD_HINT_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 11,
  color: "var(--wm-er-muted)",
  lineHeight: 1.45,
};

const TWO_COL_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

export function ShiftCreateBasicSection(props: Props) {
  const descLen = props.description.length;
  const isOther = !CATEGORIES.slice(0, -1).includes(props.category);
  const [showCustom, setShowCustom] = useState(isOther && props.category.length > 0);

  function handleSelectChange(val: string) {
    if (val === "Other") {
      setShowCustom(true);
      props.onCategory("");
      return;
    }

    setShowCustom(false);
    props.onCategory(val);
  }

  const selectValue = showCustom
    ? "Other"
    : CATEGORIES.includes(props.category)
      ? props.category
      : "";

  return (
    <section className="wm-er-card" style={CARD_STYLE}>
      <SectionHead
        icon={<IconInfo />}
        title="Basic Information"
        sub="Tell workers what this shift is about"
      />

      <div style={TWO_COL_STYLE}>
        <div className="wm-field">
          <div className="wm-label">
            Company / Business Name <span style={{ color: "var(--wm-error)" }}>*</span>
          </div>
          <input
            className="wm-input"
            value={props.companyName}
            onChange={(e) => props.onCompanyName(e.target.value)}
            placeholder="Enter company name"
            maxLength={100}
          />
          {props.companyAutoFilled && (
            <div style={FIELD_HINT_STYLE}>From your company profile.</div>
          )}
        </div>

        <div className="wm-field">
          <div className="wm-label">
            Job Title / Role <span style={{ color: "var(--wm-error)" }}>*</span>
          </div>
          <input
            className="wm-input"
            value={props.jobName}
            onChange={(e) => props.onJobName(e.target.value)}
            placeholder="e.g. Driver, Helper, Cleaner"
            maxLength={100}
          />
        </div>
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Industry / Category</div>
        <select
          className="wm-input"
          value={selectValue}
          onChange={(e) => handleSelectChange(e.target.value)}
        >
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {showCustom && (
          <input
            className="wm-input"
            style={{ marginTop: 8 }}
            value={props.category}
            onChange={(e) => props.onCategory(e.target.value)}
            placeholder="Describe your industry / category"
            maxLength={60}
            autoFocus
          />
        )}

        {props.categoryAutoFilled && !showCustom && (
          <div style={FIELD_HINT_STYLE}>From your company profile.</div>
        )}
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Job Description</div>
        <textarea
          className="wm-input"
          style={{ height: 92, paddingTop: 10, fontFamily: "inherit", lineHeight: 1.45 }}
          value={props.description}
          onChange={(e) => props.onDescription(e.target.value)}
          placeholder="Briefly describe the work, reporting expectations, and anything workers should know."
          maxLength={500}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 4,
            fontSize: 11,
            color: "var(--wm-er-muted)",
          }}
        >
          <span>Clear descriptions improve application quality.</span>
          <span
            style={{
              fontWeight: 800,
              color: descLen > 450 ? "var(--wm-warning)" : "var(--wm-er-muted)",
            }}
          >
            {descLen}/500
          </span>
        </div>
      </div>
    </section>
  );
}
