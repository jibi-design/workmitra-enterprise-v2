// src/features/employer/shiftJobs/components/ShiftCreateBasicSection.tsx
//
// Basic Info section — category is now a proper dropdown + "Other" custom input.

import { useState } from "react";
import { SectionHead, IconInfo } from "./ShiftCreateIcons";

/* ------------------------------------------------ */
/* Category list                                    */
/* ------------------------------------------------ */
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

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  companyName: string; onCompanyName: (v: string) => void; companyAutoFilled: boolean;
  jobName: string;     onJobName: (v: string) => void;
  category: string;    onCategory: (v: string) => void;   categoryAutoFilled: boolean;
  description: string; onDescription: (v: string) => void;
};

const HINT: React.CSSProperties = {
  marginTop: 3, fontSize: 11,
  color: "var(--wm-er-muted)", fontStyle: "italic",
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ShiftCreateBasicSection(props: Props) {
  const descLen = props.description.length;

  /* If current category is not in the fixed list → it's a custom "Other" value */
  const isOther  = !CATEGORIES.slice(0, -1).includes(props.category);
  const [showCustom, setShowCustom] = useState(isOther && props.category.length > 0);

  function handleSelectChange(val: string) {
    if (val === "Other") {
      setShowCustom(true);
      props.onCategory("");
    } else {
      setShowCustom(false);
      props.onCategory(val);
    }
  }

  /* Derive the select value */
  const selectValue = showCustom ? "Other" : (CATEGORIES.includes(props.category) ? props.category : "");

  return (
    <section className="wm-er-card" style={{ marginTop: 12 }}>
      <SectionHead icon={<IconInfo />} title="Basic Information" />

      {/* Company */}
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
        {props.companyAutoFilled && <div style={HINT}>From your company profile</div>}
      </div>

      {/* Job Title */}
      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">
          Job Title / Role <span style={{ color: "var(--wm-error)" }}>*</span>
        </div>
        <input
          className="wm-input"
          value={props.jobName}
          onChange={(e) => props.onJobName(e.target.value)}
          placeholder="Enter job title"
          maxLength={100}
        />
      </div>

      {/* Category */}
      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Industry / Category</div>
        <select
          className="wm-input"
          value={selectValue}
          onChange={(e) => handleSelectChange(e.target.value)}
        >
          <option value="" disabled>Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Custom input when "Other" selected */}
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
          <div style={HINT}>From your company profile</div>
        )}
      </div>

      {/* Description */}
      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Job Description</div>
        <textarea
          className="wm-input"
          style={{ height: 80, paddingTop: 10, fontFamily: "inherit" }}
          value={props.description}
          onChange={(e) => props.onDescription(e.target.value)}
          placeholder="Brief description of what the work involves..."
          maxLength={500}
        />
        <div style={{
          textAlign: "right", fontSize: 11, fontWeight: 600, marginTop: 3,
          color: descLen > 450 ? "var(--wm-warning)" : "var(--wm-er-muted)",
        }}>
          {descLen}/500
        </div>
      </div>
    </section>
  );
}