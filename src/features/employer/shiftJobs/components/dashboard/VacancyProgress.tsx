// App name: Job Mitra
// File name: VacancyProgress.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\dashboard\VacancyProgress.tsx

type VacancyProgressProps = {
  confirmedCount: number;
  vacancies: number;
  appliedCount: number;
  shortlistCount: number;
  backupCount: number;
  backupSlots: number;
};

export function VacancyProgress({
  confirmedCount,
  vacancies,
  appliedCount,
  shortlistCount,
  backupCount,
  backupSlots,
}: VacancyProgressProps) {
  const progressPct =
    vacancies > 0 ? Math.min(100, Math.round((confirmedCount / vacancies) * 100)) : 0;
  const progressColor =
    progressPct === 100 ? "#16a34a" : progressPct >= 50 ? "#d97706" : "var(--wm-er-accent-shift)";
  const backupPct =
    backupSlots > 0 ? Math.min(100, Math.round((backupCount / backupSlots) * 100)) : 0;

  return (
    <section
      style={{
        marginTop: 12,
        padding: "15px 16px",
        borderRadius: 20,
        background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
        border: "1px solid rgba(226,232,240,0.95)",
        boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
            Vacancy Progress
          </div>
          <div
            style={{ marginTop: 4, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.45 }}
          >
            Track confirmed workers, applicants, shortlist, and backup coverage.
          </div>
        </div>

        <div
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(22,163,74,0.08)",
            border: "1px solid rgba(22,163,74,0.16)",
            fontSize: 12,
            fontWeight: 950,
            color: progressColor,
            whiteSpace: "nowrap",
          }}
        >
          {confirmedCount} / {vacancies} selected
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          height: 9,
          borderRadius: 999,
          background: "rgba(226,232,240,0.95)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            background: progressColor,
            borderRadius: 999,
            transition: "width 0.4s",
          }}
        />
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        <ProgressMeta label="Applied" value={appliedCount} />
        <ProgressMeta label="Shortlisted" value={shortlistCount} />
        <ProgressMeta
          label="Backup"
          value={backupSlots > 0 ? `${backupCount}/${backupSlots}` : String(backupCount)}
        />
      </div>

      <div
        style={{
          marginTop: 10,
          padding: "9px 11px",
          borderRadius: 14,
          background: "rgba(22,163,74,0.06)",
          border: "1px solid rgba(22,163,74,0.14)",
          color: "var(--wm-er-muted)",
          fontSize: 11,
          fontWeight: 750,
          lineHeight: 1.45,
        }}
      >
        Backup workers can be used if selected workers cancel or do not attend.
      </div>

      {backupSlots > 0 && backupCount > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{ fontSize: 11, color: "var(--wm-er-muted)", marginBottom: 5, fontWeight: 750 }}
          >
            Backup slots filled: {backupCount} / {backupSlots}
          </div>

          <div
            style={{
              height: 5,
              borderRadius: 999,
              background: "rgba(226,232,240,0.95)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${backupPct}%`,
                background: backupPct >= 100 ? "#16a34a" : "#d97706",
                borderRadius: 999,
                transition: "width 0.4s",
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function ProgressMeta({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        padding: "9px 8px",
        borderRadius: 14,
        background: "rgba(248,250,252,0.96)",
        border: "1px solid rgba(226,232,240,0.9)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 3, fontSize: 13, fontWeight: 950, color: "var(--wm-er-text)" }}>
        {value}
      </div>
    </div>
  );
}
