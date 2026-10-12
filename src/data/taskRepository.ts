import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "../core/firebase";
import { toDateSafe } from "../core/date";
import type { Task, TaskInput, Priority } from "../domain/task";

function tasksCol(uid: string) {
  return collection(getDb(), `users/${uid}/tasks`);
}

function parseTask(id: string, data: Record<string, unknown>): Task | null {
  const due = toDateSafe(data["dueDate"]);
  const created = toDateSafe(data["createdAt"]) ?? new Date();
  const updated = toDateSafe(data["updatedAt"]) ?? new Date();
  const priority = data["priority"];
  if (!due) return null; // malformed -> skip, don't crash list
  if (priority !== "low" && priority !== "medium" && priority !== "high")
    return null;
  return {
    id,
    title: String(data["title"] ?? ""),
    description: String(data["description"] ?? ""),
    dueDate: due,
    priority: priority as Priority,
    completed: Boolean(data["completed"]),
    createdAt: created,
    updatedAt: updated,
  };
}

export const taskRepository = {
  subscribe(uid: string, onData: (tasks: Task[]) => void, onError: (e: unknown) => void): Unsubscribe {
    // Order by dueDate asc for server-side base ordering; client re-sorts deterministically.
    const q = query(tasksCol(uid), orderBy("dueDate", "asc"));
    return onSnapshot(
      q,
      (snap) => {
        const tasks: Task[] = [];
        snap.forEach((d) => {
          const t = parseTask(d.id, d.data());
          if (t) tasks.push(t);
        });
        onData(tasks);
      },
      (e) => onError(e)
    );
  },

  async create(uid: string, input: TaskInput): Promise<string> {
    const ref = await addDoc(tasksCol(uid), {
      title: input.title.trim(),
      description: input.description ?? "",
      dueDate: Timestamp.fromDate(input.dueDate),
      priority: input.priority,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async update(uid: string, id: string, input: TaskInput): Promise<void> {
    await updateDoc(doc(getDb(), `users/${uid}/tasks/${id}`), {
      title: input.title.trim(),
      description: input.description ?? "",
      dueDate: Timestamp.fromDate(input.dueDate),
      priority: input.priority,
      updatedAt: serverTimestamp(),
    });
  },

  async toggleComplete(uid: string, id: string, completed: boolean): Promise<void> {
    await updateDoc(doc(getDb(), `users/${uid}/tasks/${id}`), {
      completed,
      updatedAt: serverTimestamp(),
    });
  },

  async remove(uid: string, id: string): Promise<void> {
    await deleteDoc(doc(getDb(), `users/${uid}/tasks/${id}`));
  },
};
