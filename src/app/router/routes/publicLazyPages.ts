/** Job Mitra | publicLazyPages.ts | Auth + guest browse lazy chunks */

import { lazyPage } from "../lazyPage";

export const LoginPage = lazyPage(() =>
  import("../../../features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
export const RegisterPage = lazyPage(() =>
  import("../../../features/auth/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
export const ForgotPasswordPage = lazyPage(() =>
  import("../../../features/auth/pages/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
export const ResetPasswordPage = lazyPage(() =>
  import("../../../features/auth/pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
export const LandingRolePickPage = lazyPage(() =>
  import("../../../features/auth/pages/LandingRolePickPage").then((m) => ({
    default: m.LandingRolePickPage,
  })),
);
export const PublicLandingPage = lazyPage(() =>
  import("../../../features/public/pages/PublicLandingPage").then((m) => ({
    default: m.PublicLandingPage,
  })),
);
export const GuestExplorePage = lazyPage(() =>
  import("../../../features/guest/pages/GuestExplorePage").then((m) => ({
    default: m.GuestExplorePage,
  })),
);
export const GuestShiftsPage = lazyPage(() =>
  import("../../../features/guest/pages/GuestShiftsPage").then((m) => ({
    default: m.GuestShiftsPage,
  })),
);
export const GuestShiftDetailPage = lazyPage(() =>
  import("../../../features/guest/pages/GuestShiftDetailPage").then((m) => ({
    default: m.GuestShiftDetailPage,
  })),
);
export const GuestCareersPage = lazyPage(() =>
  import("../../../features/guest/pages/GuestCareersPage").then((m) => ({
    default: m.GuestCareersPage,
  })),
);
export const GuestCareerDetailPage = lazyPage(() =>
  import("../../../features/guest/pages/GuestCareerDetailPage").then((m) => ({
    default: m.GuestCareerDetailPage,
  })),
);
