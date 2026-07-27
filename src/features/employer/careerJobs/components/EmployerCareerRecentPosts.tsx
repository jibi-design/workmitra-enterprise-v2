// App name: Job Mitra
// File name: EmployerCareerRecentPosts.tsx

import type { EmployerCareerRecentPostsProps } from "./EmployerCareerRecentPosts.helpers";
import {
  EmployerCareerEmptyPosts,
  EmployerCareerRecentPostButton,
} from "./EmployerCareerRecentPosts.parts";
import { CAREER_MUTED, CAREER_TEXT } from "./EmployerCareerRecentPosts.styles";

export function EmployerCareerRecentPosts({ posts, onOpenPost }: EmployerCareerRecentPostsProps) {
  if (posts.length === 0) {
    return <EmployerCareerEmptyPosts />;
  }

  return (
    <section style={{ display: "grid", gap: 9 }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 950, color: CAREER_TEXT }}>Hiring pipeline</div>
        <div
          style={{
            marginTop: 4,
            fontSize: 11.5,
            fontWeight: 750,
            color: CAREER_MUTED,
            lineHeight: 1.45,
          }}
        >
          Open a Career Job to review applicants, offers, and hired workspace status.
        </div>
      </div>

      <div style={{ display: "grid", gap: 9 }}>
        {posts.map((post) => (
          <EmployerCareerRecentPostButton key={post.id} post={post} onOpenPost={onOpenPost} />
        ))}
      </div>
    </section>
  );
}
