// Lightweight framework-agnostic auth store backed by localStorage.
// Tokens persist across reloads; subscribers are notified on change so React
// components (via useSyncExternalStore) and the router stay in sync.

const ACCESS_KEY = "hireloop.accessToken";
const REFRESH_KEY = "hireloop.refreshToken";
const USER_KEY = "hireloop.user";

const listeners = new Set();

const hasStorage = () => typeof window !== "undefined" && !!window.localStorage;

function notify() {
  listeners.forEach((l) => l());
}

export const authStore = {
  getAccessToken() {
    return hasStorage() ? window.localStorage.getItem(ACCESS_KEY) : null;
  },
  getRefreshToken() {
    return hasStorage() ? window.localStorage.getItem(REFRESH_KEY) : null;
  },
  getUser() {
    if (!hasStorage()) return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  isAuthenticated() {
    return !!this.getAccessToken();
  },
  setSession(res, extra) {
    if (!hasStorage()) return;
    window.localStorage.setItem(ACCESS_KEY, res.accessToken);
    window.localStorage.setItem(REFRESH_KEY, res.refreshToken ?? "");
    const user = {
      userId: res.userId,
      email: res.email,
      ...extra,
    };
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    notify();
  },
  patchUser(patch) {
    if (!hasStorage()) return;
    const current = this.getUser();
    if (!current) return;
    const next = { ...current, ...patch };
    window.localStorage.setItem(USER_KEY, JSON.stringify(next));
    notify();
  },
  clear() {
    if (!hasStorage()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(USER_KEY);
    notify();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
