/** Job Mitra | EmployerHomeHero.tsx | Welcome greeting + unified status strips */

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { HomeGreetingStrip } from "../../../../shared/home/HomeGreetingStrip";
import { HomeStatusStripStack } from "../../../../shared/home/HomeWelcomeStack";
import { useHomeInboxTicker } from "../../../notifications/hooks/useHomeInboxTicker";
import {
  findConfirmWaitingPost,
  getPostsSnapshot,
  shiftPostDashboardPath,
  subscribePosts,
} from "../../shiftJobs/helpers/shiftHomeHelpers";
import { enrichEmployerTickerDetails } from "../helpers/enrichEmployerTickerDetails";
import { useEmployerOfferPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployerOfferPendingHubItems";
import { useEmployerRoleHomePendingActions } from "../../../../shared/pendingActions/hooks/useEmployerRoleHomePendingActions";
import { useEmployerShiftConfirmPendingHubItems } from "../../../../shared/pendingActions/hooks/useEmployerShiftConfirmPendingHubItems";

type EmployerHomeHeroProps = {
  readonly companyName: string;
};

export function EmployerHomeHero({ companyName }: EmployerHomeHeroProps) {
  return (
    <HomeGreetingStrip
      displayName={companyName.trim() || "Partner"}
      testId="employer-home-compact-header"
    />
  );
}

export function EmployerHomeBanners() {
  const nav = useNavigate();
  const ticker = useHomeInboxTicker("employer");
  const posts = useSyncExternalStore(subscribePosts, getPostsSnapshot, getPostsSnapshot);
  const waiting = useMemo(() => findConfirmWaitingPost(posts), [posts]);
  const items = useMemo(
    () => enrichEmployerTickerDetails(ticker.items, posts),
    [posts, ticker.items],
  );
  const offers = useEmployerOfferPendingHubItems(nav);
  const confirms = useEmployerShiftConfirmPendingHubItems(nav);
  const reviews = useEmployerRoleHomePendingActions(nav);
  const hubPending = useMemo(
    () => [...confirms, ...offers, ...reviews].reduce((sum, item) => sum + item.count, 0),
    [confirms, offers, reviews],
  );
  return (
    <HomeStatusStripStack
      tickerTestId="employer-home-inbox-ticker"
      tickerRole="employer"
      tickerItem={ticker.item}
      tickerItems={items}
      onOpenTickerItem={ticker.onOpenItem}
      extraPendingCount={(waiting ? 1 : 0) + hubPending}
      onFallbackPendingOpen={
        waiting ? () => nav(shiftPostDashboardPath(waiting.postId)) : undefined
      }
    />
  );
}
