// Local cache for job targets. The backend reliably returns a JobTarget from
// POST /targets and POST /targets/{id}, but a GET list endpoint may not exist.
// We mirror every mutation here so the Targets page always has data, and try
// the network GET first when available.
import { authStore } from "./auth-store";

const keyFor = (userId) => `hireloop.targets.${userId ?? "anon"}`;

const hasStorage = () => typeof window !== "undefined" && !!window.localStorage;

export const targetsCache = {
  getAll() {
    if (!hasStorage()) return [];
    const userId = authStore.getUser()?.userId;
    const raw = window.localStorage.getItem(keyFor(userId));
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
  setAll(targets) {
    if (!hasStorage()) return;
    const userId = authStore.getUser()?.userId;
    window.localStorage.setItem(keyFor(userId), JSON.stringify(targets));
  },
  upsert(target) {
    const all = this.getAll();
    const idx = all.findIndex((t) => t.id === target.id);
    if (idx >= 0) all[idx] = target;
    else all.unshift(target);
    this.setAll(all);
    return all;
  },
  remove(id) {
    const all = this.getAll().filter((t) => t.id !== id);
    this.setAll(all);
    return all;
  },
};
