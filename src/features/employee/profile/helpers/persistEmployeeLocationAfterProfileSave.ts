/** Job Mitra | After profile save, dual-write commute fields onto availability (LS + server). */

import { availabilityStorage } from "../../shiftJobs/storage/availabilityStorage";
import { syncAvailabilityBroadcastToServer } from "../../shiftJobs/services/availabilityServerSync";
import { upsertCareerLocationProfile } from "../../../career/services/careerLocationApi";
import type { EmployeeProfile } from "../storage/employeeProfile.storage";

export function persistEmployeeLocationAfterProfileSave(updated: EmployeeProfile): void {
  void upsertCareerLocationProfile({
    basePincode: updated.basePincode || undefined,
    careerCommuteRadius: updated.careerCommuteRadius,
  }).catch(() => {
    /* local-first */
  });

  const selectedDates = availabilityStorage.getMySelectedDates();
  if (selectedDates.length > 0) {
    availabilityStorage.saveMyAvailability({
      workerMlId: updated.uniqueId || `anon_${Date.now()}`,
      workerName: updated.fullName.trim() || "Worker",
      selectedDates,
      city: updated.city.trim() || undefined,
      basePincode: updated.basePincode,
      commuteRadius: updated.commuteRadius,
    });
    return;
  }

  syncAvailabilityBroadcastToServer({
    selectedDates: [],
    city: updated.city.trim() || undefined,
    basePincode: updated.basePincode || undefined,
    commuteRadius: updated.commuteRadius,
  });
}
