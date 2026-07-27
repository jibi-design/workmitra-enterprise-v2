import fs from 'fs';

const files = [
  'src/features/employer/careerJobs/hooks/careerPostDashboard/useCareerDashboardCandidateActions.ts',
  'src/features/employer/workforceOps/services/workforceGroupMemberService.ts',
  'src/features/employer/careerJobs/hooks/careerPostDashboard/useCareerDashboardAnalysisState.ts',
  'src/features/employee/workforceOps/services/employeeWorkforceHelpers.ts',
  'src/features/employer/workforceOps/services/workforceGroupService.ts',
  'src/features/employer/workforceOps/services/workforceService.ts',
  'src/features/employer/planner/hooks/useEmployerDemandPlannerState.ts',
  'src/features/employer/shiftJobs/hooks/useEmployerShiftWorkspaceState.ts',
  'src/features/employee/shiftJobs/hooks/shiftPostApply/useShiftPostApplyActions.ts',
  'src/features/employee/notifications/helpers/employeeNotificationService.ts',
  'src/features/shift/services/shiftDbTruth.service.ts',
  'src/features/employee/workVault/services/vaultAccessService.ts',
  'src/features/employee/workVault/services/vaultCareerAggregator.ts',
  'src/features/employer/careerJobs/services/careerOfferHireService.ts',
];

for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/).length;
  const status = lines <= 300 ? 'OK' : 'OVER';
  console.log(`${lines}\t${status}\t${f}`);
}
