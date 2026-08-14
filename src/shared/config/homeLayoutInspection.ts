/** Job Mitra | homeLayoutInspection.ts — force-show home cards for layout setup */

/**
 * Temporary layout-inspection mode for Employee + Employer home pages.
 * When true:
 * - Daily/first-open welcome card is suppressed
 * - Onboarding overlay is suppressed on home
 * - Conditional nudges / pending hubs may force-visible for layout
 *
 * NEVER write into employment lifecycle, Work Diary (`wm_work_diary_*`),
 * or Work Vault storage from this flag.
 *
 * Flip to `false` before production release.
 */
export const HOME_LAYOUT_INSPECTION = true as boolean;
