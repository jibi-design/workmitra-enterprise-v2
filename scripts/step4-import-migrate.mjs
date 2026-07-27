import fs from "fs";
import path from "path";

const srcRoot = path.resolve("src");

/** Map employer/employee import suffix → shared module path under src/ */
const TARGET_BY_SUFFIX = {
  "employer/planner/storage/plannerPublicIndex.storage": "features/shared/planner/plannerPublic",
  "employer/planner/storage/plannerPublicIndex.read": "features/shared/planner/plannerPublic",
  "employer/planner/helpers/plannerPayDisplay.helpers": "features/shared/planner/plannerPublic",
  "employer/planner/storage/demandPlannerStorage": "features/shared/planner/plannerPublic",
  "employer/shiftJobs/storage/employerShift.postActions": "features/shared/shift/shiftEmployerPublic",
  "employer/shiftJobs/storage/employerShift.employeeBridge": "features/shared/shift/shiftEmployerPublic",
  "employer/shiftJobs/storage/shiftDirectInvite.storage": "features/shared/shift/shiftEmployerPublic",
  "employer/shiftJobs/services/shiftDirectInvite.service": "features/shared/shift/shiftEmployerPublic",
  "employer/shiftJobs/helpers/directInviteWorkspace.helpers": "features/shared/shift/shiftEmployerPublic",
  "employer/shiftJobs/storage/employerShift.types": "features/shared/shift/shiftEmployerPublic",
  "employer/shiftJobs/types/shiftWorkspaceTypes": "features/shared/shift/shiftEmployerPublic",
  "employer/careerJobs/helpers/careerStorageUtils": "features/career/helpers/careerStoragePublic",
  "employer/careerJobs/helpers/careerNormalizers": "features/career/helpers/careerStoragePublic",
  "employer/careerJobs/helpers/careerNotifications": "features/career/services/careerEmployerPublic",
  "employer/careerJobs/services/careerPostService": "features/career/services/careerEmployerPublic",
  "employer/careerJobs/services/careerOfferHireService": "features/career/services/careerEmployerPublic",
  "employer/careerJobs/helpers/careerValidation": "features/career/services/careerEmployerPublic",
  "employer/myStaff/storage/myStaff.storage": "features/career/storage/myStaffPublic",
  "employer/company/storage/employerSettings.storage": "shared/employerProfile/employerSettingsPublic",
  "employer/hrManagement/types/hrManagement.types": "features/shared/hr/hrPublic",
  "employer/hrManagement/types/staffAvailability.types": "features/shared/hr/hrPublic",
  "employer/hrManagement/types/taskAssignment.types": "features/shared/hr/hrPublic",
  "employer/hrManagement/types/incidentReport.types": "features/shared/hr/hrPublic",
  "employer/hrManagement/types/leaveManagement.types": "features/shared/hr/hrPublic",
  "employer/hrManagement/types/performanceReview.types": "features/shared/hr/hrPublic",
  "employer/hrManagement/storage/hrManagement.storage": "features/shared/hr/hrPublic",
  "employer/hrManagement/storage/staffAvailability.storage": "features/shared/hr/hrPublic",
  "employer/hrManagement/storage/taskAssignment.storage": "features/shared/hr/hrPublic",
  "employer/hrManagement/storage/incidentReport.storage": "features/shared/hr/hrPublic",
  "employer/hrManagement/storage/leaveManagement.storage": "features/shared/hr/hrPublic",
  "employer/hrManagement/storage/performanceReview.storage": "features/shared/hr/hrPublic",
  "employer/hrManagement/services/hrService": "features/shared/hr/hrPublic",
  "employer/hrManagement/helpers/rosterPlannerHooks": "features/shared/hr/hrPublic",
  "employer/hrManagement/helpers/staffAvailabilityHooks": "features/shared/hr/hrPublic",
  "employer/hrManagement/helpers/performanceReviewSubscription": "features/shared/hr/hrPublic",
  "employer/hrManagement/helpers/leaveSubscription": "features/shared/hr/hrPublic",
  "employer/hrManagement/helpers/rosterPlannerConstants": "features/shared/hr/hrPublic",
  "employer/hrManagement/helpers/staffAvailabilityConstants": "features/shared/hr/hrPublic",
  "employer/hrManagement/helpers/taskConstants": "features/shared/hr/hrPublic",
  "employer/hrManagement/components/LeaveBalanceCard": "features/shared/hr/hrPublic",
  "employer/hrManagement/components/LeaveRequestCard": "features/shared/hr/hrPublic",
  "employer/workforceOps/services/workforceGroupMemberService": "features/shared/workforce/workforcePublic",
  "employee/workVault/components/VaultProfileTab": "features/shared/workVault/vaultPublic",
  "employee/workVault/services/vaultDocumentService": "features/shared/workVault/vaultPublic",
  "employee/workVault/services/vaultFolderService": "features/shared/workVault/vaultPublic",
  "employee/workVault/services/vaultDataAggregator": "features/shared/workVault/vaultPublic",
  "employee/workVault/services/shiftVaultHistory.service": "features/shared/workVault/vaultPublic",
  "employee/planner/services/plannerEmployeeNotifications.service": "features/shared/planner/plannerEmployeeBridge",
  "employee/planner/services/plannerDiarySync.service": "features/shared/planner/plannerEmployeeBridge",
  "employee/planner/services/plannerCommitmentStreak.service": "features/shared/planner/plannerEmployeeBridge",
  "employee/shiftJobs/storage/shiftAvailabilityPulseQueue.storage": "features/shared/shift/shiftEmployeeBridge",
  "employee/careerJobs/services/careerEmploymentSideSyncService": "features/career/services/careerEmploymentPublic",
  "employee/careerJobs/services/careerEmploymentStatusMap": "features/career/services/careerEmploymentPublic",
  "employee/workforceOps/pages/EmployeeWorkforceCompanyPage": "features/shared/workforce/workforcePublic",
  "employee/workforceOps/pages/EmployeeWorkforceAnnounceDetailPage": "features/shared/workforce/workforcePublic",
  "employee/workforceOps/pages/EmployeeWorkforceGroupPage": "features/shared/workforce/workforcePublic",
  "employee/workforceOps/pages/EmployeeWorkforceTimesheetPage": "features/shared/workforce/workforcePublic",
};

const SKIP_DIRS = [
  `${path.sep}features${path.sep}shared${path.sep}`,
  `${path.sep}career${path.sep}helpers${path.sep}careerStoragePublic`,
  `${path.sep}career${path.sep}services${path.sep}careerEmployerPublic`,
  `${path.sep}career${path.sep}services${path.sep}careerEmploymentPublic`,
  `${path.sep}career${path.sep}storage${path.sep}myStaffPublic`,
  `${path.sep}employerProfile${path.sep}employerSettingsPublic`,
];

function walk(dir, acc = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx)$/.test(f.name)) acc.push(p);
  }
  return acc;
}

function relImport(fromFile, targetModule) {
  const fromDir = path.dirname(fromFile);
  const toFile = path.join(srcRoot, targetModule + ".ts");
  let rel = path.relative(fromDir, toFile).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  rel = rel.replace(/\.ts$/, "");
  return rel;
}

const importRe = /from\s+["']((?:\.\.\/)+)(employer|employee)\/([^"']+)["']/g;

let changed = 0;
for (const file of walk(srcRoot)) {
  if (SKIP_DIRS.some((s) => file.includes(s.replace(/\//g, path.sep)))) continue;

  let text = fs.readFileSync(file, "utf8");
  const before = text;

  text = text.replace(importRe, (full, _dots, role, rest) => {
    const suffix = `${role}/${rest}`;
    const target = TARGET_BY_SUFFIX[suffix];
    if (!target) return full;
    const quote = full.includes('"') ? '"' : "'";
    return `from ${quote}${relImport(file, target)}${quote}`;
  });

  if (text !== before) {
    fs.writeFileSync(file, text);
    changed++;
    console.log("updated:", path.relative(srcRoot, file));
  }
}

console.log("TOTAL_UPDATED:", changed);

function countCross(role, other) {
  let files = 0;
  let imports = 0;
  function scan(dir) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) scan(p);
      else if (/\.(ts|tsx)$/.test(f.name)) {
        const txt = fs.readFileSync(p, "utf8");
        const re = new RegExp(`(?:features/|\\.{1,2}/.*)${other}/`, "g");
        const m = txt.match(re);
        if (m) {
          files++;
          imports += m.length;
        }
      }
    }
  }
  scan(path.join(srcRoot, "features", role));
  return { files, imports };
}

console.log("CROSS employee->employer:", JSON.stringify(countCross("employee", "employer")));
console.log("CROSS employer->employee:", JSON.stringify(countCross("employer", "employee")));
