/** Job Mitra | EmployerHomeHero.tsx | Welcome + unified status strips */

import { HomeWelcomeStack } from "../../../../shared/home/HomeWelcomeStack";
import { useHomeInboxTicker } from "../../../notifications/hooks/useHomeInboxTicker";
import { EmployerConfirmShortlistStrip } from "./EmployerConfirmShortlistStrip";

type EmployerHomeHeroProps = {
  readonly companyName: string;
};

export function EmployerHomeHero({ companyName }: EmployerHomeHeroProps) {
  const ticker = useHomeInboxTicker("employer");
  return (
    <HomeWelcomeStack
      displayName={companyName.trim() || "Partner"}
      greetTestId="employer-home-compact-header"
      tickerTestId="employer-home-inbox-ticker"
      tickerItem={ticker.item}
      onOpenTicker={ticker.onOpen}
      extraStrips={<EmployerConfirmShortlistStrip />}
    />
  );
}
