// App name: Job Mitra
// File name: CareerOfferModal.tsx

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { CareerOfferInput, CareerSalaryPeriod } from "../types/careerTypes";
import { getOfferValidationMessage, getTodayInputValue } from "./CareerOfferModal.helpers";
import {
  CareerOfferCandidateHeader,
  CareerOfferNoticePeriod,
  CareerOfferSalaryFields,
} from "./CareerOfferModal.parts";
import {
  getSubmitButtonStyle,
  helperStyle,
  inputStyle,
  labelStyle,
  shellStyle,
  titleStyle,
} from "./CareerOfferModal.styles";

type Props = {
  open: boolean;
  jobTitle: string;
  candidateName: string;
  candidateWorkerId: string;
  onClose: () => void;
  onSubmit: (data: CareerOfferInput) => void;
};

export function CareerOfferModal({
  open,
  jobTitle,
  candidateName,
  candidateWorkerId,
  onClose,
  onSubmit,
}: Props) {
  const [role, setRole] = useState(jobTitle);
  const [salaryStr, setSalary] = useState("");
  const [period, setPeriod] = useState<CareerSalaryPeriod>("monthly");
  const [startDate, setStart] = useState("");
  const [message, setMessage] = useState("");
  const [noticeDays, setNoticeDays] = useState<0 | 7 | 14 | 30>(0);

  const [todayInputValue] = useState(() => getTodayInputValue());

  const salary = Number(salaryStr);
  const validationMessage = getOfferValidationMessage(role, salaryStr, startDate, todayInputValue);
  const canSubmit = validationMessage.length === 0;

  function handleSubmit() {
    if (!canSubmit) return;

    onSubmit({
      jobTitle: role.trim(),
      salary: Math.floor(salary),
      salaryPeriod: period,
      startDate: startDate.trim(),
      noticePeriodDays: noticeDays,
      message: message.trim() || undefined,
    });

    resetAndClose();
  }

  function resetAndClose() {
    setRole(jobTitle);
    setSalary("");
    setPeriod("monthly");
    setStart("");
    setMessage("");
    setNoticeDays(0);
    onClose();
  }

  return (
    <CenterModal open={open} onBackdropClose={() => {}} ariaLabel="Send Job Offer">
      <div style={shellStyle}>
        <div style={titleStyle}>Send Job Offer</div>

        <div style={helperStyle}>
          Save this offer in the local hiring pipeline. No external email, SMS, or phone message is
          sent.
        </div>

        <CareerOfferCandidateHeader
          candidateName={candidateName}
          candidateWorkerId={candidateWorkerId}
        />

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Job title *</label>
          <input
            type="text"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="Job title for this offer"
            maxLength={100}
            style={inputStyle}
          />
        </div>

        <CareerOfferSalaryFields
          salaryStr={salaryStr}
          period={period}
          onSalaryChange={setSalary}
          onPeriodChange={setPeriod}
        />

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Expected start date *</label>
          <input
            type="date"
            value={startDate}
            min={todayInputValue}
            onChange={(event) => setStart(event.target.value)}
            style={inputStyle}
          />
        </div>

        <CareerOfferNoticePeriod noticeDays={noticeDays} onNoticeDaysChange={setNoticeDays} />

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Message to candidate optional</label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Add offer notes or joining details"
            maxLength={300}
            rows={3}
            style={{ ...inputStyle, resize: "vertical", paddingTop: 10 }}
          />

          <div
            style={{
              textAlign: "right",
              fontSize: 11,
              color: "var(--wm-er-muted, #64748b)",
              marginTop: 4,
              fontWeight: 800,
            }}
          >
            {message.length}/300
          </div>
        </div>

        {!canSubmit && (
          <div style={helperStyle}>
            {validationMessage ||
              "Enter job title, valid salary, and expected start date to enable Send Offer."}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr",
            gap: "var(--wm-space-10)",
            marginTop: "var(--wm-stack-gap)",
          }}
        >
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={resetAndClose}
            style={{
              fontSize: 13,
              minHeight: 42,
              padding: "0 14px",
              borderRadius: "var(--wm-radius-chip)",
            }}
          >
            Cancel
          </button>

          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={getSubmitButtonStyle(canSubmit)}
          >
            Send Offer
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
