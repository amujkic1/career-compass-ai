const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";

const listeners = new Set();

const hasStorage = () => typeof window !== "undefined" && !!window.localStorage;

function readUserFromStorage() {
  if (!hasStorage()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

let cachedUser = readUserFromStorage();

function notify() {
  listeners.forEach((l) => l());
}

function pickString(values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function normalizeAccessToken(res) {
  const token = pickString([
    res?.accessToken,
    res?.token,
    res?.jwt,
    res?.jwtToken,
    res?.data?.accessToken,
    res?.data?.token,
    res?.authenticationResponse?.accessToken,
  ]);

  return token ? token.replace(/^Bearer\s+/i, "") : null;
}

function normalizeRefreshToken(res) {
  return (
    pickString([
      res?.refreshToken,
      res?.data?.refreshToken,
      res?.authenticationResponse?.refreshToken,
    ]) ?? ""
  );
}

function normalizeUser(res, extra) {
  const source =
    (res?.user && typeof res.user === "object" && res.user) ||
    (res?.data?.user && typeof res.data.user === "object" && res.data.user) ||
    (res?.authenticationResponse?.user &&
      typeof res.authenticationResponse.user === "object" &&
      res.authenticationResponse.user) ||
    null;

  if (source) {
    return { ...source, ...extra };
  }

  const user = {
    userId: res?.userId,
    email: res?.email,
    premium: res?.premium,
    ...extra,
  };

  return Object.values(user).some((value) => value !== undefined) ? user : null;
}

export const authStore = {
  getAccessToken() {
    return hasStorage() ? window.localStorage.getItem(ACCESS_KEY) : null;
  },
  getRefreshToken() {
    return hasStorage() ? window.localStorage.getItem(REFRESH_KEY) : null;
  },
  getUser() {
    return cachedUser;
  },
  isAuthenticated() {
    return !!this.getAccessToken();
  },
  setSession(res, extra) {
    if (!hasStorage()) return;
    const accessToken = normalizeAccessToken(res);
    if (!accessToken) return;

    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, normalizeRefreshToken(res));

    const user = normalizeUser(res, extra);
    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      cachedUser = user;
    } else {
      window.localStorage.removeItem(USER_KEY);
      cachedUser = null;
    }

    notify();
  },
  patchUser(patch) {
    if (!hasStorage()) return;
    const current = this.getUser();
    if (!current) return;
    const next = { ...current, ...patch };
    window.localStorage.setItem(USER_KEY, JSON.stringify(next));
    cachedUser = next;
    notify();
  },
  clear() {
    if (!hasStorage()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(USER_KEY);
    cachedUser = null;
    notify();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
