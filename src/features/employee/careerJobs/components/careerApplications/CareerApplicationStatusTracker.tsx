import type { AppLite } from "../../types/careerApplicationTypes";
import { CareerApplicationStepper } from "./CareerApplicationStepper";
import { CareerApplicationStatusMessage } from "./CareerApplicationStatusMessage";
import {
  getApplicationStageIndex,
  isFailedApplicationStage,
} from "./careerApplicationStage.helpers";

export function CareerApplicationStatusTracker({
  app,
  title,
  body,
}: {
  app: AppLite;
  title: string;
  body: string;
}) {
  const currentIndex = getApplicationStageIndex(app.stage);
  const isFailed = isFailedApplicationStage(app.stage);

  return (
    <div
      style={{
        marginTop: 16,
        padding: "16px",
        borderRadius: "var(--wm-radius-chip)",
        background: "linear-gradient(135deg, #f8fafc, #ffffff)",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      <CareerApplicationStepper app={app} currentIndex={currentIndex} />
      <CareerApplicationStatusMessage
        app={app}
        title={title}
        body={body}
        currentIndex={currentIndex}
        isFailed={isFailed}
      />
    </div>
  );
}
