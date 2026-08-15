/** Job Mitra | HomeGreetingStrip.tsx | Time greeting → name-only fade */

import { GREET_FADE_MS, useHomeGreetingReveal } from "./useHomeGreetingReveal";

type Props = {
  readonly displayName: string;
  readonly testId: string;
};

export function HomeGreetingStrip({ displayName, testId }: Props) {
  const { greeting, showName } = useHomeGreetingReveal();
  const name = displayName.trim() || "You";
  const fullLine = `${greeting}, ${name}`;

  const fade = { transitionDuration: `${GREET_FADE_MS}ms` };

  return (
    <header
      className="wm-homeCompactHeader"
      data-testid={testId}
      data-greet-phase={showName ? "name" : "greet"}
      aria-label={showName ? name : fullLine}
    >
      <p className="wm-homeCompactHeader__greet" aria-hidden={showName} style={fade}>
        {fullLine}
      </p>
      <p className="wm-homeCompactHeader__name" aria-hidden={!showName} style={fade}>
        {name}
      </p>
    </header>
  );
}
