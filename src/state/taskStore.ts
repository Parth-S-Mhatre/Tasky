import { create } from "zustand";
import type { Unsubscribe } from "firebase/firestore";
import { friendlyFirestoreError } from "../core/errors";
import {
  filterAndSortTasks,
  type PriorityFilter,
  type StatusFilter,
  type Task,
  type TaskInput,
} from "../domain/task";
import { taskRepository } from "../data/taskRepository";

interface TaskState {
  tasks: Task[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  priorityFilter: PriorityFilter;
  statusFilter: StatusFilter;
  uid: string | null;
  unsub: Unsubscribe | null;
  subscribe: (uid: string) => void;
  handleAccountChange: (uid: string | null) => void;
  setPriorityFilter: (f: PriorityFilter) => void;
  setStatusFilter: (f: StatusFilter) => void;
  clearFilters: () => void;
  create: (input: TaskInput) => Promise<boolean>;
  update: (id: string, input: TaskInput) => Promise<boolean>;
  toggle: (id: string, completed: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
  retry: () => void;
  visibleTasks: () => Task[];
  counts: () => { total: number; completed: number; pending: number };
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  saving: false,
  error: null,
  priorityFilter: "all",
  statusFilter: "all",
  uid: null,
  unsub: null,

  subscribe: (uid) => {
    // Prevent duplicate listeners.
    if (get().uid === uid && get().unsub) return;
    get().unsub?.();
    set({ uid, loading: true, error: null, tasks: [] });
    const unsub = taskRepository.subscribe(
      uid,
      (tasks) => set({ tasks, loading: false, error: null }),
      (e) => set({ loading: false, error: friendlyFirestoreError(e) })
    );
    set({ unsub });
  },

  handleAccountChange: (uid) => {
    get().unsub?.();
    if (!uid) {
      set({ uid: null, tasks: [], loading: false, saving: false, error: null, unsub: null });
      return;
    }
    get().subscribe(uid);
  },

  setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  clearFilters: () => set({ priorityFilter: "all", statusFilter: "all" }),

  create: async (input) => {
    const { uid, saving } = get();
    if (!uid || saving) return false;
    set({ saving: true, error: null });
    try {
      await taskRepository.create(uid, input);
      set({ saving: false });
      return true;
    } catch (e) {
      set({ saving: false, error: friendlyFirestoreError(e) });
      return false;
    }
  },

  update: async (id, input) => {
    const { uid, saving } = get();
    if (!uid || saving) return false;
    set({ saving: true, error: null });
    try {
      await taskRepository.update(uid, id, input);
      set({ saving: false });
      return true;
    } catch (e) {
      set({ saving: false, error: friendlyFirestoreError(e) });
      return false;
    }
  },

  toggle: async (id, completed) => {
    const { uid } = get();
    if (!uid) return;
    // Optimistic update for snappy UI; snapshot corrects on error.
    const prev = get().tasks;
    set({ tasks: prev.map((t) => (t.id === id ? { ...t, completed } : t)) });
    try {
      await taskRepository.toggleComplete(uid, id, completed);
    } catch (e) {
      set({ tasks: prev, error: friendlyFirestoreError(e) });
    }
  },

  remove: async (id) => {
    const { uid } = get();
    if (!uid) return;
    set({ saving: true, error: null });
    try {
      await taskRepository.remove(uid, id);
    } catch (e) {
      set({ error: friendlyFirestoreError(e) });
    } finally {
      set({ saving: false });
    }
  },

  retry: () => {
    const { uid } = get();
    if (uid) get().subscribe(uid);
  },

  visibleTasks: () => {
    const { tasks, priorityFilter, statusFilter } = get();
    return filterAndSortTasks(tasks, priorityFilter, statusFilter);
  },

  counts: () => {
    const { tasks } = get();
    const completed = tasks.filter((t) => t.completed).length;
    return { total: tasks.length, completed, pending: tasks.length - completed };
  },
}));
