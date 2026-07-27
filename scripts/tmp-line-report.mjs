import fs from "fs";

const files = [
  "src/features/employer/careerJobs/components/careerResult/CareerResultFormModal.tsx",
  "src/features/employee/workVault/components/VaultPerformanceCard.tsx",
  "src/features/employer/careerJobs/components/EmployerMyEmployeesCard.tsx",
  "src/features/employer/home/pages/EmployerAnalyticsPage.tsx",
  "src/features/employer/hrManagement/components/ExitClearanceSection.tsx",
  "src/features/employer/shiftJobs/components/ShiftRatingSection.tsx",
  "src/features/employee/careerJobs/components/CareerPostDetailSections.tsx",
  "src/features/employer/careerJobs/pages/EmployerCareerCandidateWorkVaultReviewPage.tsx",
  "src/features/employer/careerJobs/components/CareerCreateConfirmModal.tsx",
  "src/features/employer/careerJobs/pages/EmployerCareerPostDashboardPage.tsx",
  "src/features/employer/careerJobs/components/CareerPostDashboardHeader.tsx",
  "src/features/employer/hrManagement/pages/HRCandidateDetailPage.tsx",
  "src/features/employer/shiftJobs/components/ShiftCreateQuickQuestionsSection.tsx",
  "src/features/employee/employment/components/WorkDiaryDayEntry.tsx",
  "src/features/admin/oversight/pages/AdminAlertsPage.tsx",
  "src/app/shells/EmployerShell.tsx",
];

const out = [];
for (const f of files) {
  const n = fs.readFileSync(f, "utf8").split(/\r?\n/).length;
  out.push(`${String(n).padStart(4)} ${f}`);
}
fs.writeFileSync("scripts/tmp-line-report.txt", out.join("\n") + "\n");
console.log(out.join("\n"));
