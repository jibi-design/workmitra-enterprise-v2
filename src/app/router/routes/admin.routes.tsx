/** Job Mitra | admin.routes.tsx | Admin nested routes */

import { Navigate, Route } from "react-router-dom";
import { ROUTE_PATHS } from "../routePaths";
import { AC } from "./routeSegments";
import { IS_DEV_ADMIN_ENABLED } from "./routerHelpers";
import {
  AdminAlertsPage,
  AdminAnalyticsPage,
  AdminHomePage,
  AdminNotificationsPage,
  AdminModerationPage,
  AdminSettingsPage,
  AdminUsersPage,
} from "./adminLazyPages";

export const adminRouteTree = IS_DEV_ADMIN_ENABLED ? (
  <>
    <Route index element={<AdminHomePage />} />
    <Route path={AC.alerts} element={<AdminAlertsPage />} />
    <Route path={AC.users} element={<AdminUsersPage />} />
    <Route path={AC.notifications} element={<AdminNotificationsPage />} />
    <Route path={AC.moderation} element={<AdminModerationPage />} />
    <Route path={AC.analytics} element={<AdminAnalyticsPage />} />
    <Route path={AC.settings} element={<AdminSettingsPage />} />
  </>
) : null;

export const adminDisabledRoute = !IS_DEV_ADMIN_ENABLED ? (
  <Route path="/admin/*" element={<Navigate to={ROUTE_PATHS.landing} replace />} />
) : null;
