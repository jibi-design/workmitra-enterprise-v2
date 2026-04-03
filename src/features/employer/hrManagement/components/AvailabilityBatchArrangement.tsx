// src/features/employer/hrManagement/components/AvailabilityBatchArrangement.tsx

import type { AvailabilityFormBatch } from "../types/staffAvailability.types";
import { MAX_BATCHES } from "../helpers/staffAvailabilityConstants";

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type AvailabilityBatchArrangementProps = {
  batches: AvailabilityFormBatch[];
  onMove: (hrCandidateId: string, fromBatch: number, toBatch: number) => void;
  onAddBatch: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function AvailabilityBatchArrangement({
  batches,
  onMove,
  onAddBatch,
}: AvailabilityBatchArrangementProps) {
  return (
    <div>
      <div style={{
        fontWeight: 900, fontSize: 13, color: "var(--wm-er-text)",
        marginBottom: 8, paddingTop: 6,
        borderTop: "1px solid var(--wm-er-border, #e5e7eb)",
      }}>
        Priority Batches
      </div>
      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginBottom: 10 }}>
        Batch 1 gets asked first. If not enough accept, Batch 2 is activated, and so on.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {batches.map((batch) => (
          <div
            key={batch.batchNumber}
            style={{
              padding: "10px 12px", borderRadius: 8,
              border: "1px solid var(--wm-er-border, #e5e7eb)",
              background: "#f9fafb",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 12, color: "var(--wm-er-text)", marginBottom: 6 }}>
              Batch {batch.batchNumber}
              {batch.batchNumber === 1 && (
                <span style={{ fontWeight: 600, fontSize: 10, color: "#15803d", marginLeft: 6 }}>
                  First Priority
                </span>
              )}
            </div>

            {batch.employees.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {batch.employees.map((emp) => (
                  <div
                    key={emp.hrCandidateId}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "6px 8px", borderRadius: 6,
                      background: "#fff", border: "1px solid var(--wm-er-border, #e5e7eb)",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--wm-er-text)" }}>
                      {emp.employeeName}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {batch.batchNumber > 1 && (
                        <button
                          type="button"
                          onClick={() => onMove(emp.hrCandidateId, batch.batchNumber, batch.batchNumber - 1)}
                          title="Move to higher priority batch"
                          style={{
                            background: "none", border: "1px solid var(--wm-er-border, #e5e7eb)",
                            borderRadius: 4, cursor: "pointer", padding: "2px 6px",
                            fontSize: 11, color: "var(--wm-er-muted)",
                          }}
                        >
                          ↑
                        </button>
                      )}
                      {batch.batchNumber < batches.length && (
                        <button
                          type="button"
                          onClick={() => onMove(emp.hrCandidateId, batch.batchNumber, batch.batchNumber + 1)}
                          title="Move to lower priority batch"
                          style={{
                            background: "none", border: "1px solid var(--wm-er-border, #e5e7eb)",
                            borderRadius: 4, cursor: "pointer", padding: "2px 6px",
                            fontSize: 11, color: "var(--wm-er-muted)",
                          }}
                        >
                          ↓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", fontStyle: "italic" }}>
                No employees in this batch. Select from above to add.
              </div>
            )}
          </div>
        ))}
      </div>

      {batches.length < MAX_BATCHES && (
        <button
          type="button"
          onClick={onAddBatch}
          style={{
            marginTop: 8, width: "100%", padding: "8px 0",
            fontSize: 12, fontWeight: 700, color: "var(--wm-er-accent-console, #0369a1)",
            background: "none", border: "1px dashed var(--wm-er-border, #e5e7eb)",
            borderRadius: 8, cursor: "pointer",
          }}
        >
          + Add Batch {batches.length + 1}
        </button>
      )}
    </div>
  );
}
