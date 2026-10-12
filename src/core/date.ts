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
