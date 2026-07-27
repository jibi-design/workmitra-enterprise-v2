/** Candidate list chrome — pulse wrapper only when parent says this app is targeted */

import type { ReactNode } from "react";
import { PulseSectionResolver } from "../../../../features/pulse/PulseSectionResolver";
import { PulseTargetIndicator } from "../../../../features/pulse/PulseTargetIndicator";
import { PulseEvent, PulseSectionId } from "../../../../features/pulse/pulseRegistry";

type Props = {
  readonly postId: string;
  readonly appId: string;
  readonly targetedAppId: string | null;
  readonly children: ReactNode;
};

export function CandidatePulseRowChrome({ postId, appId, targetedAppId, children }: Props) {
  if (targetedAppId !== appId) {
    return <div data-candidate-row={appId}>{children}</div>;
  }

  return (
    <PulseSectionResolver
      notificationId={PulseEvent.SHIFT_APPLICATION_RECEIVED}
      sectionId={PulseSectionId.EMPLOYER_SHIFT_APPLICATION_CARD}
      postId={postId}
      appId={appId}
    >
      <div style={{ position: "relative" }} data-candidate-row={appId}>
        <PulseTargetIndicator
          notificationId={PulseEvent.SHIFT_APPLICATION_RECEIVED}
          postId={postId}
          appId={appId}
          sectionId={PulseSectionId.EMPLOYER_SHIFT_APPLICATION_CARD}
        />
        {children}
      </div>
    </PulseSectionResolver>
  );
}
