import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Crown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Hireloop" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, logout } = useAuth();
  return (
    <div>
      <PageHeader title="Settings" description="Subscription and account preferences." />

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                <Crown className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-foreground">Subscription</h2>
                <p className="text-sm text-muted-foreground">
                  You are on the {user?.premium ? "Premium" : "Free"} plan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground">Resume link</h2>
          {user?.resumeUrl ? (
            <a
              href={user.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 break-all text-sm text-primary hover:underline"
            >
              {user.resumeUrl} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No resume on file.{" "}
              <Link to="/profile" className="text-primary hover:underline">
                Upload one
              </Link>
              .
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground">Webhook subscriptions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Webhook management will appear here once enabled on the backend.
          </p>
        </section>

        <Button variant="outline" onClick={logout}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
