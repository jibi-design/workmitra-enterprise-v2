/** Job Mitra | ShiftSearchSaveAlert.tsx | C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftSearchSaveAlert.tsx */

import { jobAlertStorage } from "../../../../shared/utils/jobAlertStorage";
import type { ShiftAlertCriteria } from "../../../../shared/utils/jobAlertTypes";
import type { ExpOpt } from "../types/shiftSearch.types";

type Props = {
  searchQuery: string;
  catFilter: string;
  exp: ExpOpt;
  minPay: number;
  onToast: (message: string, durationMs?: number) => void;
};

export function ShiftSearchSaveAlert(props: Props) {
  function handleSaveSearch() {
    const criteria: ShiftAlertCriteria = {
      domain: "shift",
      query: props.searchQuery.trim() || undefined,
      category: props.catFilter !== "any" ? props.catFilter : undefined,
      experience: props.exp !== "any" ? props.exp : undefined,
      minPay: props.minPay > 0 ? props.minPay : undefined,
    };

    const result = jobAlertStorage.save("shift", criteria);
    if (result.success) {
      props.onToast("Search saved! You'll be notified of new matches.");
      return;
    }

    props.onToast(result.reason ?? "Could not save alert.", 3000);
  }

  return (
    <button
      type="button"
      onClick={handleSaveSearch}
      style={{
        marginTop: 10,
        width: "100%",
        padding: "10px 16px",
        borderRadius: 10,
        border: "1px solid rgba(22,163,74,0.3)",
        background: "rgba(22,163,74,0.06)",
        color: "#16a34a",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      Save this search
    </button>
  );
}
