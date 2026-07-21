/** Job Mitra | adminLazyPages.ts | Admin + shared route lazy imports */

import { lazyPage } from "../lazyPage";

export const HelpSupportPage = lazyPage(() =>
  import("../../../shared/components/HelpSupportPage").then((m) => ({
    default: m.HelpSupportPage,
  })),
);

export const AdminHomePage = lazyPage(() =>
  import("../../../features/admin/home/pages/AdminHomePage").then((m) => ({
    default: m.AdminHomePage,
  })),
);
export const AdminAlertsPage = lazyPage(() =>
  import("../../../features/admin/oversight/pages/AdminAlertsPage").then((m) => ({
    default: m.AdminAlertsPage,
  })),
);
export const AdminUsersPage = lazyPage(() =>
  import("../../../features/admin/oversight/pages/AdminUsersPage").then((m) => ({
    default: m.AdminUsersPage,
  })),
);
export const AdminNotificationsPage = lazyPage(() =>
  import("../../../features/admin/oversight/pages/AdminNotificationsPage").then((m) => ({
    default: m.AdminNotificationsPage,
  })),
);
export const AdminAnalyticsPage = lazyPage(() =>
  import("../../../features/admin/oversight/pages/AdminAnalyticsPage").then((m) => ({
    default: m.AdminAnalyticsPage,
  })),
);
export const AdminSettingsPage = lazyPage(() =>
  import("../../../features/admin/oversight/pages/AdminSettingsPage").then((m) => ({
    default: m.AdminSettingsPage,
  })),
);

export const NotFoundPage = lazyPage(() =>
  import("../NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
