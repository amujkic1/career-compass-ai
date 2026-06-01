// Local cache for job targets. The backend reliably returns a JobTarget from
// POST /targets and POST /targets/{id}, but a GET list endpoint may not exist.
// We mirror every mutation here so the Targets page always has data, and try
// the network GET first when available.
import type { JobTarget } from "./types";
import { authStore } from "./auth-store";

const keyFor = (userId: number | undefined) =>
  `hireloop.targets.${userId ?? "anon"}`;

const hasStorage = () => typeof window !== "undefined" && !!window.localStorage;

export const targetsCache = {
  getAll(): JobTarget[] {
    if (!hasStorage()) return [];
    const userId = authStore.getUser()?.userId;
    const raw = window.localStorage.getItem(keyFor(userId));
    if (!raw) return [];
    try {
      return JSON.parse(raw) as JobTarget[];
    } catch {
      return [];
    }
  },
  setAll(targets: JobTarget[]) {
    if (!hasStorage()) return;
    const userId = authStore.getUser()?.userId;
    window.localStorage.setItem(keyFor(userId), JSON.stringify(targets));
  },
  upsert(target: JobTarget) {
    const all = this.getAll();
    const idx = all.findIndex((t) => t.id === target.id);
    if (idx >= 0) all[idx] = target;
    else all.unshift(target);
    this.setAll(all);
    return all;
  },
  remove(id: number) {
    const all = this.getAll().filter((t) => t.id !== id);
    this.setAll(all);
    return all;
  },
};
