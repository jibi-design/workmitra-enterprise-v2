import {
  employmentActions,
  employmentStorage,
} from "../../../../shared/employment/employmentStorage";
import { employmentLifecycleStorage } from "../../../../shared/employment/employmentLifecycle.storage";
import type { StaffRecord } from "../storage/myStaff.storage";
import { myStaffStorage } from "../storage/myStaff.storage";
import { createPendingFeedbackTask } from "./EmployerStaffDetailPage.helpers";

export function createStaffDetailHandlers(
  record: StaffRecord,
  sharedEmploymentRecord: ReturnType<typeof employmentStorage.getByPostId>,
  lifecycleRecord: ReturnType<typeof employmentLifecycleStorage.getAll>[number] | null,
  canCloseEmployment: boolean,
  setShowExitModal: (value: boolean) => void,
  setShowResignModal: (value: boolean) => void,
  setExitDone: (value: boolean) => void,
) {
  const handleConfirmJoined = async () => {
    const joinedAt = Date.now();

    myStaffStorage.updateStaff(record.id, {
      status: "active",
      joinedAt,
      employeeConfirmed: true,
    });

    const empRecords = employmentLifecycleStorage.getAll();
    const empRec = empRecords.find(
      (item) => item.careerPostId === record.careerPostId && item.status !== "exited",
    );

    if (empRec) {
      employmentLifecycleStorage.update(empRec.id, {
        status: "active",
        joinedAt,
        verified: true,
      });
    }

    if (record.careerPostId) {
      await employmentActions.markAsJoined(record.careerPostId, joinedAt);
    }
  };

  const handleExitComplete = (
    exitReason: StaffRecord["exitReason"],
    exitedAt: number,
    rating: number,
    comment: string,
  ) => {
    if (!exitReason) return;

    myStaffStorage.endEmployment(record.id, exitReason, exitedAt, rating, comment || undefined);
    createPendingFeedbackTask(
      record,
      sharedEmploymentRecord?.companyName ?? lifecycleRecord?.companyName ?? "Career Employment",
    );

    const empRecords = employmentLifecycleStorage.getAll();
    const empRec = empRecords.find(
      (item) => item.careerPostId === record.careerPostId && item.status !== "exited",
    );

    if (empRec) {
      employmentLifecycleStorage.update(empRec.id, {
        status: "exited",
        exitReason: exitReason as
          "resigned" | "terminated" | "layoff" | "contract_end" | "mutual_agreement",
        exitedAt,
        employerRating: rating,
        employerComment: comment || undefined,
        verified: true,
      });
    }

    setShowExitModal(false);
    setExitDone(true);
  };

  const handleResignAccept = async (exitedAt: number) => {
    if (!canCloseEmployment) return;

    myStaffStorage.acceptResignation(record.id, exitedAt);
    createPendingFeedbackTask(record, sharedEmploymentRecord?.companyName ?? "Career Employment");

    const empRecords = employmentLifecycleStorage.getAll();
    const empRec = empRecords.find(
      (item) => item.careerPostId === record.careerPostId && item.status !== "exited",
    );

    if (empRec) {
      employmentLifecycleStorage.update(empRec.id, {
        status: "exited",
        exitReason: "resigned",
        exitedAt,
        verified: true,
      });
    }

    if (record.careerPostId) {
      await employmentActions.confirmResignation(record.careerPostId);
    }

    setShowResignModal(false);
    setExitDone(true);
  };

  const handleRejectResignation = async () => {
    myStaffStorage.updateStaff(record.id, { status: "active" });

    if (record.careerPostId) {
      await employmentActions.withdrawResignation(record.careerPostId);
    }

    const empRecords = employmentLifecycleStorage.getAll();
    const empRec = empRecords.find(
      (item) =>
        item.careerPostId === record.careerPostId &&
        (item.status === "resignation_pending" || item.status === "notice_period"),
    );

    if (empRec) {
      employmentLifecycleStorage.update(empRec.id, {
        status: "active",
        resignationNote: undefined,
        preferredLastDate: undefined,
      });
    }
  };

  return {
    handleConfirmJoined,
    handleExitComplete,
    handleResignAccept,
    handleRejectResignation,
  };
}
