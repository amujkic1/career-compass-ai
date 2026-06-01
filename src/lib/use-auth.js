import { useSyncExternalStore } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authStore } from "./auth-store";

function subscribe(cb) {
  return authStore.subscribe(cb);
}

export function useAuthState() {
  const user = useSyncExternalStore(
    subscribe,
    () => authStore.getUser(),
    () => null,
  );
  const isAuthenticated = useSyncExternalStore(
    subscribe,
    () => authStore.isAuthenticated(),
    () => false,
  );

  return { user, isAuthenticated };
}

/**
 * Reactive auth hook. Reads the current user/token from the auth store and
 * re-renders consumers whenever the session changes.
 */
export function useAuth() {
  const { user, isAuthenticated } = useAuthState();
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
