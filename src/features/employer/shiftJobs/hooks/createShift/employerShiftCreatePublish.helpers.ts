import { clampInt } from "../../helpers/shiftCreateHelpers";
import { toCreatePayBasis } from "../../helpers/shiftCreateInput.helpers";
import { employerShiftStorage } from "../../storage/employerShift.storage";
import { employerShiftDraftStorage } from "../../storage/employerShiftDraft.storage";
import { enqueueAvailabilityMatchPulsesForShift } from "../../services/shiftAvailabilityMatchPulse.service";
import type { ShiftCreateFormSnapshot } from "./employerShiftCreateDraft.helpers";

export async function publishEmployerShiftPost(params: {
  snapshot: ShiftCreateFormSnapshot;
  mustList: string[];
  goodList: string[];
  payPerDay: number;
  draftId: string | null;
}): Promise<string | null> {
  const { snapshot, mustList, goodList, payPerDay, draftId } = params;
  const payBasis = snapshot.payBasis;

  const postId = await employerShiftStorage.createPost({
    companyName: snapshot.companyName.trim(),
    jobName: snapshot.jobName.trim(),
    category: snapshot.category.trim() || "Other",
    experience: snapshot.experience,
    payPerDay: payBasis === "not_listed" ? 0 : clampInt(payPerDay, 0, 1_000_000),
    payBasis: toCreatePayBasis(payBasis),
    locationName: snapshot.locationName.trim(),
    locationAddress: snapshot.locationAddress.trim(),
    distanceKm: 0,
    startAt: snapshot.startAt,
    endAt: snapshot.endAt,
    description: snapshot.description.trim(),
    shiftTiming: snapshot.shiftTiming.trim(),
    mapsLink: snapshot.mapsLink.trim(),
    isHiddenFromSearch: false,
    mustHave: mustList,
    goodToHave: goodList,
    whatWeProvide: snapshot.whatWeProvide,
    quickQuestions: snapshot.quickQuestions.length > 0 ? snapshot.quickQuestions : undefined,
    dressCode: snapshot.dressCode.trim() || undefined,
    jobType: snapshot.jobType,
    vacancies: clampInt(Number(snapshot.vacanciesStr) || 1, 1, 1000),
    waitingBuffer: clampInt(Number(snapshot.backupSlotsStr) || 0, 0, 20),
    settings: {
      backupSlots: clampInt(Number(snapshot.backupSlotsStr) || 0, 0, 20),
      autoPromoteBackup: true,
      notifyBackup: true,
    },
  });

  if (!postId) return null;

  enqueueAvailabilityMatchPulsesForShift({
    postId,
    startAt: snapshot.startAt,
    endAt: snapshot.endAt,
  });

  if (draftId) {
    employerShiftDraftStorage.deleteDraft(draftId);
  }

  return postId;
}
