/** Design DNA barrel — Wave 1 common primitives for all domain pages.
 * Card SSOT (mobile-first): --wm-dna-card-padding 14px, --wm-dna-card-min-height 140px.
 * Primary glass / domain / landing tiles must consume these tokens — no local size overrides.
 */

export { HomeGlassCardShell, type HomeGlassCardShellProps } from "./HomeGlassCardShell";
export { GlassContainer, type GlassContainerProps } from "./GlassContainer";
export { DomainCard, type DomainCardDomain, type DomainCardProps } from "./DomainCard";
export { ActionPill, type ActionPillDomain, type ActionPillProps } from "./ActionPill";
export { HeaderNavbarBrand, JobMitraBrandMark, MitraLabsBrandMark } from "./HeaderNavbar";
export { DomainHero, type DomainHeroProps, type DomainHeroVariant } from "./DomainHero";
export { HomeSectionPanel } from "./HomeSectionPanel";
export { StatusBadge, type StatusBadgeProps } from "../enterprise/StatusBadge";
