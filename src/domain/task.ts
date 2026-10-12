import { z } from "zod";

export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().max(2000).default(""),
  dueDate: z.date({ required_error: "Due date is required" }),
  priority: z.enum(["low", "medium", "high"]),
});

export type TaskInput = z.infer<typeof taskInputSchema>;

export const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AuthInput = z.infer<typeof authSchema>;

export type PriorityFilter = "all" | Priority;
export type StatusFilter = "all" | "completed" | "incomplete";

/** Client-side filtering + deterministic sorting (dueDate asc, createdAt asc, id asc). */
export function filterAndSortTasks(
  tasks: Task[],
  priority: PriorityFilter,
  status: StatusFilter
): Task[] {
  const filtered = tasks.filter((t) => {
    if (priority !== "all" && t.priority !== priority) return false;
    if (status === "completed" && !t.completed) return false;
    if (status === "incomplete" && t.completed) return false;
    return true;
  });
  return filtered.sort((a, b) => {
    const d = a.dueDate.getTime() - b.dueDate.getTime();
    if (d !== 0) return d;
    const c = a.createdAt.getTime() - b.createdAt.getTime();
    if (c !== 0) return c;
    return a.id.localeCompare(b.id);
  });
}
