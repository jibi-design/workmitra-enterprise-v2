// App name: Job Mitra
// File name: EmployerCareerPostsPage.tsx
// Ultra-Enterprise U2/U4 — responsive filters + skeleton boot

import { useSyncExternalStore } from "react";
import { EnterpriseSkeleton } from "../../../../shared/components/enterprise";
import {
  CareerPostsEmptyState,
  EmployerCareerPostCard,
} from "../components/EmployerCareerPostsSections";
import type { CareerPostStatusFilter } from "../helpers/employerCareerPostList.helpers";
import {
  POSTS_CREATE_BUTTON_STYLE,
  POSTS_EYEBROW_STYLE,
  POSTS_FILTER_CARD_STYLE,
  POSTS_HERO_STYLE,
  POSTS_INPUT_STYLE,
  POSTS_PAGE_STYLE,
  POSTS_PREMIUM_STYLE_SHEET,
  POSTS_SEARCH_ICON_STYLE,
  POSTS_SUBTITLE_STYLE,
  POSTS_TITLE_STYLE,
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
      <div className="wm-er-vCareer" style={POSTS_PAGE_STYLE}>
        <EnterpriseSkeleton domain="career" count={3} testId="career-posts-skeleton" />
      </div>
    );
  }

  return (
    <div className="wm-er-vCareer" style={POSTS_PAGE_STYLE}>
      <style>{POSTS_PREMIUM_STYLE_SHEET}</style>

      <section style={POSTS_HERO_STYLE}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div
            style={{
              padding: 14,
              borderRadius: 18,
              background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(29,78,216,0.05))",
              color: "#2563eb",
              border: "1px solid rgba(37,99,235,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div>
            <div style={POSTS_EYEBROW_STYLE}>Career posts</div>
            <div style={{ ...POSTS_TITLE_STYLE, marginTop: 4 }}>Career Post List</div>
            <div style={POSTS_SUBTITLE_STYLE}>
              Active posts appear first. Filled, paused, draft, and closed posts stay available for
              review and future reuse.
            </div>
          </div>
        </div>

        <button type="button" onClick={page.openCreate} style={POSTS_CREATE_BUTTON_STYLE}>
          Create Career Job
        </button>
      </section>

      <section
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
        <section style={{ display: "grid", gap: 16 }}>
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
