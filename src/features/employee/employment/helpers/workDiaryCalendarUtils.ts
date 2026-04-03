// src/features/employee/employment/helpers/workDiaryCalendarUtils.ts
//
// Calendar grid builder for Work Diary. Pure utility — no React.

export type DiaryCalendarDay = {
  dateKey: string;
  dayNum: number;
  isCurrentMonth: boolean;
};

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function buildDiaryCalendarGrid(year: number, month: number): DiaryCalendarDay[][] {
  const firstDay = new Date(year, month - 1, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(year, month, 0).getDate();
  const days: DiaryCalendarDay[] = [];

  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    days.push({ dateKey: formatDateKey(y, m, d), dayNum: d, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ dateKey: formatDateKey(year, month, d), dayNum: d, isCurrentMonth: true });
  }

  const remainder = days.length % 7;
  if (remainder > 0) {
    const fill = 7 - remainder;
    for (let d = 1; d <= fill; d++) {
      const m = month === 12 ? 1 : month + 1;
      const y = month === 12 ? year + 1 : year;
      days.push({ dateKey: formatDateKey(y, m, d), dayNum: d, isCurrentMonth: false });
    }
  }

  const weeks: DiaryCalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function formatDiaryDateDisplay(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function formatDiaryDateLong(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "long", day: "2-digit", month: "short", year: "numeric",
  });
}