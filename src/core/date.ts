export function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** Add calendar months while clamping dates such as Jan 31 to month end. */
export function addMonths(d: Date, n: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d.getDate(), lastDay));
  target.setHours(d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  return target;
}

/** Local calendar key (not UTC) for matching date-only calendar cells. */
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Parse a local YYYY-MM-DD value without JavaScript's UTC date-string shift. */
export function parseDateKey(value: string | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year!, month! - 1, day!, 12);
  if (dateKey(parsed) !== value) return undefined;
  return parsed;
}

/** Consistent short label, e.g. "1 May". Avoids locale surprises in list. */
export function formatDueDate(d: Date): string {
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${day} ${month}`;
}

export function formatFullDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type DateSection = "Overdue" | "Today" | "Tomorrow" | "This week" | "Later";

export function sectionForDueDate(due: Date, now = new Date()): DateSection {
  const today = startOfDay(now);
  const day = startOfDay(due);
  const diff = Math.round((day.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 7) return "This week";
  return "Later";
}

export const SECTION_ORDER: DateSection[] = [
  "Overdue",
  "Today",
  "Tomorrow",
  "This week",
  "Later",
];

export function toDateSafe(v: unknown): Date | null {
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  // Firestore Timestamp
  if (v && typeof v === "object" && "toDate" in (v as Record<string, unknown>)) {
    try {
      const d = (v as { toDate: () => Date }).toDate();
      if (!isNaN(d.getTime())) return d;
    } catch {
      return null;
    }
  }
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}
