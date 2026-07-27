// App name: Job Mitra | EmployerCareerPostsPage.tsx — DomainHero (Wave 2)

import { useSyncExternalStore } from "react";
import { EnterpriseSkeleton } from "../../../../shared/components/enterprise";
import { EmployerCareerPostsHeader } from "../components/EmployerCareerPostsHeader";
import {
  CareerPostsEmptyState,
  EmployerCareerPostCard,
} from "../components/EmployerCareerPostsSections";
import type { CareerPostStatusFilter } from "../helpers/employerCareerPostList.helpers";
import {
  POSTS_FILTER_CARD_STYLE,
  POSTS_INPUT_STYLE,
  POSTS_PAGE_STYLE,
  POSTS_PREMIUM_STYLE_SHEET,
  POSTS_SEARCH_ICON_STYLE,
} from "../helpers/employerCareerPostsPage.styles";
import { useEmployerCareerPostsPage } from "../hooks/useEmployerCareerPostsPage";

export function EmployerCareerPostsPage() {
  const page = useEmployerCareerPostsPage();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!hydrated) {
    return (
      <div className="wm-er-vCareer wm-stackGrid" style={POSTS_PAGE_STYLE}>
        <EnterpriseSkeleton domain="career" count={3} testId="career-posts-skeleton" />
      </div>
    );
  }

  return (
    <div
      className="wm-er-vCareer wm-stackGrid"
      data-testid="employer-career-posts-page"
      style={POSTS_PAGE_STYLE}
    >
      <style>{POSTS_PREMIUM_STYLE_SHEET}</style>

      <EmployerCareerPostsHeader onCreate={page.openCreate} />

      <section
        className="wm-career-surface-glass"
        style={{
          ...POSTS_FILTER_CARD_STYLE,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
        data-testid="career-posts-filter-grid"
      >
        <div style={{ position: "relative", width: "100%" }}>
          <span style={POSTS_SEARCH_ICON_STYLE}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            value={page.query}
            onChange={(event) => page.setQuery(event.target.value)}
            placeholder="Search by job, company, department, or location"
            style={{ ...POSTS_INPUT_STYLE, paddingLeft: 40 }}
          />
        </div>

        <select
          value={page.status}
          onChange={(event) => page.setStatus(event.target.value as CareerPostStatusFilter)}
          style={POSTS_INPUT_STYLE}
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
          <option value="filled">Filled</option>
          <option value="closed">Closed</option>
        </select>
      </section>

      {page.filtered.length === 0 ? (
        <CareerPostsEmptyState hasAnyPosts={page.posts.length > 0} onCreate={page.openCreate} />
      ) : (
        <section style={{ display: "grid", gap: "var(--wm-stack-gap)" }}>
          {page.filtered.map((post) => (
            <EmployerCareerPostCard
              key={post.id}
              post={post}
              onOpen={() => page.openPost(post.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
