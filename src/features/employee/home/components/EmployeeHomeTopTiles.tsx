/** Job Mitra | EmployeeHomeTopTiles.tsx | Welcome + unified status strips */

import { HomeWelcomeStack } from "../../../../shared/home/HomeWelcomeStack";
import { useEmployeeHomeNotice } from "../hooks/useEmployeeHomeNotice";
import { UpcomingShiftNudgeCard } from "./UpcomingShiftNudgeCard";

type Props = {
  readonly userName: string;
};

export function EmployeeHomeTopTiles({ userName }: Props) {
  const ticker = useEmployeeHomeNotice();
  return (
    <HomeWelcomeStack
      displayName={userName.trim() || "You"}
      greetTestId="employee-home-compact-header"
      tickerTestId="employee-home-inbox-ticker"
      tickerItem={ticker.item}
      onOpenTicker={ticker.onOpen}
      extraStrips={<UpcomingShiftNudgeCard />}
    />
  );
}
