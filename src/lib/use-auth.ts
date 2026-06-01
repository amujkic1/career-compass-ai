import { useSyncExternalStore } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authStore } from "./auth-store";
import type { AuthUser } from "./types";

function subscribe(cb: () => void) {
  return authStore.subscribe(cb);
}

/**
 * Reactive auth hook. Reads the current user/token from the auth store and
 * re-renders consumers whenever the session changes.
 */
export function useAuth() {
  const user = useSyncExternalStore<AuthUser | null>(
    subscribe,
    () => authStore.getUser(),
    () => null,
  );
  const isAuthenticated = useSyncExternalStore(
    subscribe,
    () => authStore.isAuthenticated(),
    () => false,
  );
  const navigate = useNavigate();

  return {
    user,
    isAuthenticated,
    logout: () => {
      authStore.clear();
      navigate({ to: "/login" });
    },
  };
}
