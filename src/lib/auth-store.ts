// Lightweight framework-agnostic auth store backed by localStorage.
// Tokens persist across reloads; subscribers are notified on change so React
// components (via useSyncExternalStore) and the router stay in sync.
import type { AuthResponse, AuthUser } from "./types";

const ACCESS_KEY = "hireloop.accessToken";
const REFRESH_KEY = "hireloop.refreshToken";
const USER_KEY = "hireloop.user";

type Listener = () => void;
const listeners = new Set<Listener>();

const hasStorage = () => typeof window !== "undefined" && !!window.localStorage;

function notify() {
  listeners.forEach((l) => l());
}

export const authStore = {
  getAccessToken(): string | null {
    return hasStorage() ? window.localStorage.getItem(ACCESS_KEY) : null;
  },
  getRefreshToken(): string | null {
    return hasStorage() ? window.localStorage.getItem(REFRESH_KEY) : null;
  },
  getUser(): AuthUser | null {
    if (!hasStorage()) return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
  setSession(res: AuthResponse, extra?: Partial<AuthUser>) {
    if (!hasStorage()) return;
    window.localStorage.setItem(ACCESS_KEY, res.accessToken);
    window.localStorage.setItem(REFRESH_KEY, res.refreshToken ?? "");
    const user: AuthUser = {
      userId: res.userId,
      email: res.email,
      ...extra,
    };
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    notify();
  },
  patchUser(patch: Partial<AuthUser>) {
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
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
