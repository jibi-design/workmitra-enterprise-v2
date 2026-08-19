/** Job Mitra API | Shared career_posts SELECT including work area code. */

export const CAREER_POST_SELECT = `id, employer_user_id, title, description, location,
  location_pincode, status, COALESCE(details, '{}'::jsonb) AS details,
  created_at, updated_at`;
