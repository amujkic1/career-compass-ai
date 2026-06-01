import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { targetsCache } from "@/lib/targets-store";
import { authStore } from "@/lib/auth-store";
import type { JobTarget, ScrapedJobResponse } from "@/lib/types";

const TARGETS_KEY = ["targets"];

export function useTargets() {
  return useQuery({
    queryKey: TARGETS_KEY,
    queryFn: async (): Promise<JobTarget[]> => {
      try {
        const data = await api.listTargets();
        if (Array.isArray(data)) {
          targetsCache.setAll(data);
          return data;
        }
        return targetsCache.getAll();
      } catch {
        // GET endpoint may be unavailable; fall back to local cache.
        return targetsCache.getAll();
      }
    },
    enabled: authStore.isAuthenticated(),
  });
}

export function useCreateTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScrapedJobResponse) => api.createTarget(payload),
    onSuccess: (saved) => {
      targetsCache.upsert(saved);
      qc.setQueryData<JobTarget[]>(TARGETS_KEY, () => targetsCache.getAll());
      qc.invalidateQueries({ queryKey: TARGETS_KEY });
    },
  });
}

export function useUpdateTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ScrapedJobResponse }) =>
      api.updateTarget(id, payload),
    onSuccess: (saved) => {
      targetsCache.upsert(saved);
      qc.setQueryData<JobTarget[]>(TARGETS_KEY, () => targetsCache.getAll());
      qc.invalidateQueries({ queryKey: TARGETS_KEY });
    },
  });
}

export function useDeleteTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteTarget(id),
    onSuccess: (_void, id) => {
      targetsCache.remove(id);
      qc.setQueryData<JobTarget[]>(TARGETS_KEY, () => targetsCache.getAll());
      qc.invalidateQueries({ queryKey: TARGETS_KEY });
    },
  });
}
