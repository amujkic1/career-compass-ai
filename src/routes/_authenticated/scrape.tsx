import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Search, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobTargetEditor } from "@/components/JobTargetEditor";
import { api, ApiError } from "@/lib/api-client";
import { useCreateTarget } from "@/lib/use-targets";
import type { ScrapedJobResponse } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/scrape")({
  head: () => ({ meta: [{ title: "Scrape Job — Hireloop" }] }),
  component: ScrapePage,
});

const empty: ScrapedJobResponse = { title: "", company: "", description: "", requirements: "" };

function ScrapePage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScrapedJobResponse | null>(null);
  const [editing, setEditing] = useState(false);

  const scrapeMutation = useMutation({
    mutationFn: () => api.scrape(url.trim()),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Job details extracted");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not scrape this URL"),
  });

  const createTarget = useCreateTarget();

  const save = (value: ScrapedJobResponse) => {
    createTarget.mutate(value, {
      onSuccess: () => {
        toast.success("Saved as job target");
        navigate({ to: "/targets" });
      },
      onError: (err) => {
        const msg =
          err instanceof ApiError && err.status === 404
            ? "Save endpoint unavailable on the backend."
            : err instanceof Error
              ? err.message
              : "Could not save target";
        toast.error(msg);
      },
    });
  };

  return (
    <div>
      <PageHeader title="Scrape a job" description="Paste a job posting URL to extract its details." />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!url.trim()) {
            toast.error("Enter a job posting URL");
            return;
          }
          scrapeMutation.mutate();
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://company.com/jobs/senior-engineer"
          aria-label="Job posting URL"
        />
        <Button type="submit" disabled={scrapeMutation.isPending}>
          {scrapeMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Scrape
        </Button>
      </form>

      {result && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{result.title || "Untitled role"}</h2>
              <p className="text-sm text-muted-foreground">{result.company || "Unknown company"}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button size="sm" onClick={() => save(result)} disabled={createTarget.isPending}>
                <Save className="h-4 w-4" /> Save as target
              </Button>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Description</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {result.description || "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Requirements</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {result.requirements || "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      <JobTargetEditor
        open={editing}
        onOpenChange={setEditing}
        initial={result ?? empty}
        title="Edit job details"
        saving={createTarget.isPending}
        onSave={(value) => {
          setResult(value);
          setEditing(false);
        }}
      />
    </div>
  );
}
