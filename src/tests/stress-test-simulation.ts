import {
  writeEmployeeApplications,
  readEmployeeApplications,
} from "../features/employer/shiftJobs/storage/employerShift.employeeBridge";
import { confirmCandidate } from "../features/employer/shiftJobs/storage/employerShift.candidateActions";
import type {
  ShiftPost,
  EmployeeShiftApplication,
} from "../features/employer/shiftJobs/storage/employerShift.types";
import { EMPLOYEE_WORKSPACES_KEY } from "../features/employer/shiftJobs/storage/employerShift.keys";

type BottleneckInput = {
  storageQuotaExceeded: boolean;
  writeMs: number;
  readMs: number;
  sagaOpsPerSec: number;
};

type PerformanceWithMemory = Performance & {
  memory?: { usedJSHeapSize: number };
};

// Helper to create a ShiftPost object
function makePost(scale: number): ShiftPost {
  return {
    id: `stress_post_${scale}`,
    companyName: "StressTest Corp",
    jobName: "Load Test Role",
    category: "general",
    experience: "fresher_ok",
    payPerDay: 100,
    locationName: "Test Location",
    distanceKm: 0,
    startAt: Date.now() + 86400000,
    endAt: Date.now() + 172800000,
    mustHave: [],
    goodToHave: [],
    vacancies: Math.floor(scale * 0.1),
    waitingBuffer: 0,
    analysisStatus: "not_started",
    confirmedIds: [],
    shortlistIds: [],
    waitingIds: [],
    rejectedIds: [],
    status: "active",
    settings: {
      backupSlots: 0,
      autoPromoteBackup: false,
      notifyBackup: false,
    },
  };
}

// Helper to create EmployeeShiftApplication objects
function makeApplications(scale: number, postId: string): EmployeeShiftApplication[] {
  return Array.from({ length: scale }, (_, i) => ({
    id: `stress_app_${i}`,
    postId,
    status: "applied",
    createdAt: Date.now(),
    profileSnapshot: { uniqueId: `WMID_STRESS_${i}`, fullName: `Worker ${i}` },
    mustHaveAnswers: {},
    goodToHaveAnswers: {},
    notes: {},
  }));
}

// Helper to measure localStorage size
function getStorageSizeKB(key: string): number {
  return (localStorage.getItem(key)?.length ?? 0) / 1024;
}

// Helper to get memory usage
function getMemoryMB(): number | null {
  const mem = (performance as PerformanceWithMemory).memory;
  return mem ? mem.usedJSHeapSize / 1048576 : null;
}

// Helper to classify bottleneck level
function classifyBottleneck(result: BottleneckInput): { level: string; detail: string } {
  if (result.storageQuotaExceeded)
    return { level: "CRASHED", detail: "localStorage quota exceeded — Phase-1 DB required" };
  if (result.writeMs > 2000 || result.readMs > 1000)
    return { level: "CRITICAL", detail: "Storage I/O critically slow" };
  if (result.writeMs > 500 || result.readMs > 300 || result.sagaOpsPerSec < 100)
    return { level: "SLOW", detail: "Performance degraded" };
  return { level: "SMOOTH", detail: "All metrics within acceptable range" };
}

// Main batch runner (exported for 500-scale UI verification)
export async function runBatch(scale: number) {
  // Snapshot current localStorage
  const snapshot = { ...localStorage };
  localStorage.clear();

  const post = makePost(scale);
  const apps = makeApplications(scale, post.id);

  let storageQuotaExceeded = false;

  // Measure write latency
  const writeStart = performance.now();
  try {
    writeEmployeeApplications(apps);
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      storageQuotaExceeded = true;
    }
  }
  const writeMs = performance.now() - writeStart;

  // Measure read latency
  const readStart = performance.now();
  void readEmployeeApplications();
  const readMs = performance.now() - readStart;

  // Measure storage size
  const storageSizeKB = getStorageSizeKB(EMPLOYEE_WORKSPACES_KEY);

  // Measure saga throughput
  let confirmedOk = 0;
  let vacancyFull = 0;
  const sagaStart = performance.now();
  for (const app of apps) {
    const result = confirmCandidate(post, app.id);
    if (result.ok) confirmedOk++;
    if (!result.ok && result.reason === "vacancy_full") vacancyFull++;
  }
  const sagaMs = performance.now() - sagaStart;
  const sagaOpsPerSec = Math.round((scale / sagaMs) * 1000);

  // Restore localStorage
  localStorage.clear();
  Object.entries(snapshot).forEach(([key, value]) => localStorage.setItem(key, value));

  const memoryUsedMB = getMemoryMB();
  const bottleneck = classifyBottleneck({ storageQuotaExceeded, writeMs, readMs, sagaOpsPerSec });

  return {
    scale,
    writeMs,
    readMs,
    sagaMs,
    sagaOpsPerSec,
    confirmedOk,
    vacancyFull,
    storageSizeKB,
    storageQuotaExceeded,
    memoryUsedMB,
    bottleneck: bottleneck.level,
    bottleneckDetail: bottleneck.detail,
  };
}

// Main export function
export async function runStressTestSimulation() {
  console.log("=== STRESS TEST SIMULATION START ===");
  const scales = [500, 1_000, 10_000, 100_000];
  for (const scale of scales) {
    console.log(`=== BATCH: ${scale} ===`);
    const result = await runBatch(scale);
    console.table(result);
    if (result.bottleneck === "CRASHED") {
      console.warn("CRASHED: Skipping remaining batches");
      break;
    }
  }
  console.log("=== STRESS TEST SIMULATION END ===");
}
