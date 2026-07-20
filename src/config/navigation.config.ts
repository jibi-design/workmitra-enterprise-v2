/** Job Mitra | navigation.config.ts | Bottom navigation per domain (paths from ROUTE_PATHS) */

import type { ElementType } from "react";
import {
  Home,
  Search,
  Briefcase,
  User,
  Clock,
  Banknote,
  CalendarCheck,
  Shield,
  IdCard,
  History,
  LayoutDashboard,
  Users,
  CalendarDays,
  LineChart,
  ClipboardList,
  FileText,
  CalendarRange,
} from "lucide-react";
import { ROUTE_PATHS } from "../app/router/routePaths";

export type NavDomain =
  | "career"
  | "shift"
  | "employeePlanner"
  | "employerShift"
  | "employerPlanner"
  | "employerCareer"
  | "employerDefault"
  | "vault"
  | "hr"
  | "employeeDefault";

export interface NavItem {
  label: string;
  path: string;
  icon: ElementType;
  domain: NavDomain;
  /** Pulse node IDs from pulseFlowBuilders — tab glows when any are in the active chain */
  pulseNodeIds?: readonly string[];
}

export interface DomainConfig {
  color: string;
  bgTint: string;
  borderTint: string;
  items: NavItem[];
}

export const NAVIGATION_CONFIG: Record<NavDomain, DomainConfig> = {
  career: {
    color: "#2563eb",
    bgTint: "rgba(238, 242, 255, 0.92)",
    borderTint: "rgba(37, 99, 235, 0.22)",
    items: [
      { label: "Home", path: ROUTE_PATHS.employeeCareerHome, icon: Home, domain: "career" },
      { label: "Jobs", path: ROUTE_PATHS.employeeCareerSearch, icon: Search, domain: "career" },
      {
        label: "Applied",
        path: ROUTE_PATHS.employeeCareerApplications,
        icon: Briefcase,
        domain: "career",
      },
      { label: "Profile", path: ROUTE_PATHS.employeeProfile, icon: User, domain: "career" },
    ],
  },
  shift: {
    color: "#27ae60",
    bgTint: "rgba(240, 253, 244, 0.92)",
    borderTint: "rgba(255, 255, 255, 0.8)",
    items: [
      { label: "Home", path: ROUTE_PATHS.employeeShiftCenter, icon: Clock, domain: "shift" },
      {
        label: "Find Shifts",
        path: ROUTE_PATHS.employeeShiftSearch,
        icon: Search,
        domain: "shift",
      },
      {
        label: "My Work",
        path: ROUTE_PATHS.employeeShiftApplications,
        icon: ClipboardList,
        domain: "shift",
      },
      {
        label: "Earnings",
        path: ROUTE_PATHS.employeeShiftEarnings,
        icon: Banknote,
        domain: "shift",
      },
    ],
  },
  employeePlanner: {
    color: "#0891b2",
    bgTint: "rgba(236, 254, 255, 0.92)",
    borderTint: "rgba(8, 145, 178, 0.22)",
    items: [
      {
        label: "Home",
        path: ROUTE_PATHS.employeePlannerHome,
        icon: Home,
        domain: "employeePlanner",
      },
      {
        label: "Browse",
        path: ROUTE_PATHS.employeePlannerBrowse,
        icon: Search,
        domain: "employeePlanner",
      },
      {
        label: "Applied",
        path: ROUTE_PATHS.employeePlannerApplications,
        icon: ClipboardList,
        domain: "employeePlanner",
      },
      {
        label: "Workspaces",
        path: ROUTE_PATHS.employeePlannerWorkspaces,
        icon: CalendarCheck,
        domain: "employeePlanner",
      },
      {
        label: "Earnings",
        path: ROUTE_PATHS.employeePlannerEarnings,
        icon: Banknote,
        domain: "employeePlanner",
      },
    ],
  },
  employerShift: {
    color: "#27ae60",
    bgTint: "rgba(240, 253, 244, 0.92)",
    borderTint: "rgba(255, 255, 255, 0.8)",
    items: [
      {
        label: "Home",
        path: ROUTE_PATHS.employerShiftHome,
        icon: Home,
        domain: "employerShift",
        pulseNodeIds: ["home-shift-card"],
      },
      {
        label: "My Posts",
        path: ROUTE_PATHS.employerShiftPosts,
        icon: FileText,
        domain: "employerShift",
        pulseNodeIds: ["shift-dashboard-applications"],
      },
      {
        label: "Workspaces",
        path: ROUTE_PATHS.employerShiftWorkspaces,
        icon: CalendarCheck,
        domain: "employerShift",
      },
      {
        label: "Gig",
        path: ROUTE_PATHS.employerPlannerHome,
        icon: CalendarRange,
        domain: "employerShift",
      },
    ],
  },
  employerPlanner: {
    color: "#0891b2",
    bgTint: "rgba(236, 254, 255, 0.92)",
    borderTint: "rgba(8, 145, 178, 0.22)",
    items: [
      {
        label: "Home",
        path: ROUTE_PATHS.employerPlannerHome,
        icon: Home,
        domain: "employerPlanner",
      },
      {
        label: "Plans",
        path: ROUTE_PATHS.employerPlannerPlans,
        icon: CalendarRange,
        domain: "employerPlanner",
      },
      {
        label: "New",
        path: ROUTE_PATHS.employerPlannerNew,
        icon: FileText,
        domain: "employerPlanner",
      },
    ],
  },
  employerCareer: {
    color: "#2563eb",
    bgTint: "rgba(238, 242, 255, 0.92)",
    borderTint: "rgba(37, 99, 235, 0.22)",
    items: [
      {
        label: "Home",
        path: ROUTE_PATHS.employerCareerHome,
        icon: Home,
        domain: "employerCareer",
        pulseNodeIds: ["career-dashboard-applications"],
      },
      {
        label: "Posts",
        path: ROUTE_PATHS.employerCareerPosts,
        icon: FileText,
        domain: "employerCareer",
      },
      { label: "Staff", path: ROUTE_PATHS.employerMyStaff, icon: Users, domain: "employerCareer" },
      {
        label: "Records",
        path: ROUTE_PATHS.employerCareerCompletedRecords,
        icon: ClipboardList,
        domain: "employerCareer",
      },
    ],
  },
  employerDefault: {
    color: "#7c3aed",
    bgTint: "rgba(250, 245, 255, 0.92)",
    borderTint: "rgba(124, 58, 237, 0.22)",
    items: [
      { label: "Home", path: ROUTE_PATHS.employerHome, icon: Home, domain: "employerDefault" },
      {
        label: "Shift",
        path: ROUTE_PATHS.employerShiftHome,
        icon: Clock,
        domain: "employerDefault",
      },
      {
        label: "Career",
        path: ROUTE_PATHS.employerCareerHome,
        icon: Briefcase,
        domain: "employerDefault",
      },
      {
        label: "Gig",
        path: ROUTE_PATHS.employerPlannerHome,
        icon: CalendarRange,
        domain: "employerDefault",
      },
    ],
  },
  vault: {
    color: "#9333ea",
    bgTint: "rgba(250, 245, 255, 0.92)",
    borderTint: "rgba(255, 255, 255, 0.8)",
    items: [
      { label: "Vault", path: ROUTE_PATHS.employeeVaultHome, icon: Shield, domain: "vault" },
      { label: "Identity", path: ROUTE_PATHS.employeeVaultOtp, icon: IdCard, domain: "vault" },
      { label: "Profile", path: ROUTE_PATHS.employeeProfile, icon: User, domain: "vault" },
      { label: "Logs", path: ROUTE_PATHS.employeeVaultAccessLog, icon: History, domain: "vault" },
    ],
  },
  hr: {
    color: "#9333ea",
    bgTint: "rgba(250, 245, 255, 0.92)",
    borderTint: "rgba(255, 255, 255, 0.8)",
    items: [
      { label: "HR", path: ROUTE_PATHS.employerHRManagement, icon: LayoutDashboard, domain: "hr" },
      { label: "Console", path: ROUTE_PATHS.employerConsole, icon: Users, domain: "hr" },
      {
        label: "Roster",
        path: ROUTE_PATHS.employerConsoleRoster,
        icon: CalendarDays,
        domain: "hr",
      },
      { label: "Analytics", path: ROUTE_PATHS.employerAnalytics, icon: LineChart, domain: "hr" },
    ],
  },
  employeeDefault: {
    color: "#475569",
    bgTint: "rgba(248, 250, 252, 0.95)",
    borderTint: "rgba(71, 85, 105, 0.20)",
    items: [
      { label: "Home", path: ROUTE_PATHS.employeeHome, icon: Home, domain: "employeeDefault" },
      {
        label: "Shift",
        path: ROUTE_PATHS.employeeShiftCenter,
        icon: Clock,
        domain: "employeeDefault",
      },
      {
        label: "Career",
        path: ROUTE_PATHS.employeeCareerHome,
        icon: Briefcase,
        domain: "employeeDefault",
      },
      {
        label: "Profile",
        path: ROUTE_PATHS.employeeProfile,
        icon: User,
        domain: "employeeDefault",
      },
    ],
  },
};
