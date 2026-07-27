import type { InterviewMode } from "../types/careerTypes";

const MIN_SCHEDULE_BUFFER_MINUTES = 30;
const MIN_SCHEDULE_BUFFER_MS = MIN_SCHEDULE_BUFFER_MINUTES * 60 * 1000;

export function getTodayInputValue(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getScheduleValidationMessage(
  dateValue: string,
  timeValue: string,
  mode: InterviewMode,
  locationValue: string,
  meetingLinkValue: string,
): string {
  if (!dateValue.trim() || !timeValue.trim()) {
    return "Select both date and time to enable scheduling.";
  }

  const selectedDateTime = new Date(`${dateValue}T${timeValue}`);

  if (Number.isNaN(selectedDateTime.getTime())) {
    return "Enter a valid interview date and time.";
  }

  if (selectedDateTime.getTime() < Date.now() + MIN_SCHEDULE_BUFFER_MS) {
    return `Choose a future time at least ${MIN_SCHEDULE_BUFFER_MINUTES} minutes from now.`;
  }

  if (mode === "in-person" && locationValue.trim().length < 3) {
    return "Add the interview location for an in-person interview.";
  }

  if (mode === "phone" && locationValue.trim().length < 3) {
    return "Add a phone number or contact note for a phone interview.";
  }

  if (mode === "video" && !isValidHttpUrl(meetingLinkValue.trim())) {
    return "Add a valid meeting link for a video interview.";
  }

  return "";
}
