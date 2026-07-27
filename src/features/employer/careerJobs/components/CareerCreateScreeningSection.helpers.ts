export type ScreeningQuestion = { id: string; text: string };

export const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
export const CAREER_BLUE_DEEP = "#1e3a8a";
export const CAREER_TEXT = "var(--wm-er-text, #1e293b)";
export const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
export const MAX_SCREENING_QUESTIONS = 7;

export const ROLE_SUGGESTIONS: Record<string, string[]> = {
  "full-time": [
    "Are you available to work full-time for this role?",
    "Do you meet the required experience mentioned in this post?",
    "Do you have the required qualifications listed for this role?",
    "Are you comfortable with the listed responsibilities?",
    "Are you available for the employer interview process?",
    "Are you open to the listed salary range?",
    "Can you join within the expected notice period?",
  ],
  "part-time": [
    "Are you available for part-time working hours?",
    "Can you commit to the required working days and times?",
    "Do you have experience relevant to this role?",
    "Are you comfortable with the listed responsibilities?",
    "Are you available for the employer interview process?",
    "Are you open to the listed salary range?",
    "Can you join within the expected notice period?",
  ],
  contract: [
    "Are you available to start within the required timeframe?",
    "Do you have the required skills for this contract role?",
    "Are you comfortable with the listed responsibilities?",
    "Can you commit for the full contract period?",
    "Are you open to contract extension if needed?",
    "Are you available for the employer interview process?",
    "Are you open to the listed salary range?",
  ],
};

export const DEFAULT_SUGGESTIONS = [
  "Do you meet the required experience mentioned in this post?",
  "Do you have the required qualifications listed for this role?",
  "Are you comfortable with the listed work mode?",
  "Are you available in the listed work location?",
  "Are you comfortable with the listed responsibilities?",
  "Are you available for the employer interview process?",
  "Can you join within the expected notice period?",
];

export function getSuggestions(jobType: string): string[] {
  return ROLE_SUGGESTIONS[jobType] ?? DEFAULT_SUGGESTIONS;
}

export function genScreeningQuestionId(): string {
  return `sq_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}
