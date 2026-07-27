export type QuickQuestion = { id: string; text: string };

export const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  Construction: [
    "Do you have your own safety equipment?",
    "Are you comfortable working at heights?",
    "Do you have relevant trade experience?",
  ],
  "Kitchen / Restaurant": [
    "Do you have food handling experience?",
    "Are you available for split shifts?",
    "Do you have a food hygiene certificate?",
  ],
  Catering: [
    "Do you have catering or hospitality experience?",
    "Can you work on weekends?",
    "Do you have a food hygiene certificate?",
  ],
  Driving: [
    "Do you hold a valid driving license?",
    "Do you own your own vehicle?",
    "Are you familiar with the local area?",
  ],
  Delivery: [
    "Do you hold a valid driving license?",
    "Do you own a vehicle suitable for deliveries?",
    "Can you lift packages up to 20kg?",
  ],
  Cleaning: [
    "Do you have professional cleaning experience?",
    "Are you comfortable using cleaning chemicals?",
    "Do you have your own equipment?",
  ],
  Events: [
    "Have you worked at events before?",
    "Are you comfortable in crowded environments?",
    "Can you work late evenings or weekends?",
  ],
  Warehouse: [
    "Can you lift heavy loads (25kg+)?",
    "Do you have warehouse or logistics experience?",
    "Are you available for early morning shifts?",
  ],
  Retail: [
    "Do you have retail or customer service experience?",
    "Are you comfortable with cash handling?",
    "Can you commit to all scheduled dates?",
  ],
  Security: [
    "Do you hold a valid security license?",
    "Have you worked in security before?",
    "Are you comfortable working night shifts?",
  ],
  Office: [
    "Are you proficient in MS Office?",
    "Do you have customer service experience?",
    "Do you have data entry experience?",
  ],
  Agency: [
    "Are you registered with any other agencies?",
    "Do you have relevant experience?",
    "Are you available at short notice?",
  ],
};

export const DEFAULT_SUGGESTIONS = [
  "Are you available on all listed dates?",
  "Do you have relevant experience for this role?",
  "Can you commit to the full shift duration?",
];

export const MAX_QUICK_QUESTIONS = 3;

export function capitalizeFirstLetter(value: string): string {
  const leadingSpace = value.match(/^\s*/)?.[0] ?? "";
  const rest = value.slice(leadingSpace.length);

  if (!rest) return value;

  return `${leadingSpace}${rest.charAt(0).toUpperCase()}${rest.slice(1)}`;
}

export function getSuggestions(category: string): string[] {
  const exact = CATEGORY_SUGGESTIONS[category];
  if (exact) return exact;

  const lower = category.toLowerCase();

  for (const [key, val] of Object.entries(CATEGORY_SUGGESTIONS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return val;
  }

  return DEFAULT_SUGGESTIONS;
}

export function genQuickQuestionId(): string {
  return `qq_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}
