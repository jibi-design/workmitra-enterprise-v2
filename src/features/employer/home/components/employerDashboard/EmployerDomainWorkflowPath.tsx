/** Subtle 3-step workflow — visible even when the lane is empty. */

import { EMPLOYER_DOMAIN_WORKFLOW } from "../../helpers/employerDashboard.capability";
import type { EmployerOsDomain } from "../../helpers/employerDashboard.osTypes";

type Props = {
  readonly domain: EmployerOsDomain;
};

export function EmployerDomainWorkflowPath({ domain }: Props) {
  const steps = EMPLOYER_DOMAIN_WORKFLOW[domain];
  return (
    <ol
      className={`wm-erDashWorkflow wm-erDashWorkflow--${domain}`}
      data-testid="employer-domain-workflow"
      aria-label={`${domain} workflow`}
    >
      {steps.map((step, index) => (
        <li key={step.label} className="wm-erDashWorkflow__step">
          <span className="wm-erDashWorkflow__n">{step.n}</span>
          <span className="wm-erDashWorkflow__label">{step.label}</span>
          {index < steps.length - 1 ? (
            <span className="wm-erDashWorkflow__arrow" aria-hidden="true">
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
