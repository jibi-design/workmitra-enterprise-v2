// App name: Job Mitra
// File name: useEmployerCareerCompletedRecordsPage.ts

import { useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import {
  careerEmploymentFeedbackStorage,
  type CareerEmploymentFeedbackTask,
} from "../../myStaff/storage/careerEmploymentFeedback.storage";
import { myStaffStorage, type StaffRecord } from "../../myStaff/storage/myStaff.storage";
import {
  filterCompletedCareerRecords,
  getActiveWorkspaceDepartments,
  type FeedbackStatusFilter,
} from "../helpers/employerCareerRecords.helpers";

let cachedCompletedStaffSnapshot: StaffRecord[] = [];
let cachedCompletedStaffSnapshotKey = "";

function getCompletedStaffSnapshot(): StaffRecord[] {
  const fresh = myStaffStorage.getAll().filter((record) => record.status === "exited");
  const freshKey = JSON.stringify(fresh);

  if (freshKey !== cachedCompletedStaffSnapshotKey) {
    cachedCompletedStaffSnapshot = fresh;
    cachedCompletedStaffSnapshotKey = freshKey;
  }

  return cachedCompletedStaffSnapshot;
}

let cachedFeedbackSnapshot: CareerEmploymentFeedbackTask[] = [];
let cachedFeedbackSnapshotKey = "";

function getFeedbackSnapshot(): CareerEmploymentFeedbackTask[] {
  const fresh = careerEmploymentFeedbackStorage.getAll();
  const freshKey = JSON.stringify(fresh);

  if (freshKey !== cachedFeedbackSnapshotKey) {
    cachedFeedbackSnapshot = fresh;
    cachedFeedbackSnapshotKey = freshKey;
  }

  return cachedFeedbackSnapshot;
}

function subscribeCompletedRecords(callback: () => void): () => void {
  const unsubscribeStaff = myStaffStorage.subscribe(callback);
  const unsubscribeFeedback = careerEmploymentFeedbackStorage.subscribe(callback);

  return () => {
    unsubscribeStaff();
    unsubscribeFeedback();
  };
}

export function useEmployerCareerCompletedRecordsPage() {
  const nav = useNavigate();
  const records = useSyncExternalStore(
    subscribeCompletedRecords,
    getCompletedStaffSnapshot,
    getCompletedStaffSnapshot,
  );
  const feedbackTasks = useSyncExternalStore(
    careerEmploymentFeedbackStorage.subscribe,
    getFeedbackSnapshot,
    getFeedbackSnapshot,
  );

  const [query, setQuery] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatusFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const departments = useMemo(() => getActiveWorkspaceDepartments(records), [records]);

  const filtered = useMemo(
    () =>
      filterCompletedCareerRecords({
        records,
        tasks: feedbackTasks,
        query,
        feedbackStatus,
        department: departmentFilter,
      }),
    [records, feedbackTasks, query, feedbackStatus, departmentFilter],
  );

  function openRecord(staffId: string) {
    nav(ROUTE_PATHS.employerStaffDetail.replace(":staffId", staffId));
  }

  return {
    records,
    feedbackTasks,
    query,
    setQuery,
    feedbackStatus,
    setFeedbackStatus,
    departmentFilter,
    setDepartmentFilter,
    departments,
    filtered,
    openRecord,
  };
}
