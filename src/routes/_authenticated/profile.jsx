import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { ResumeUpload } from "@/components/ResumeUpload";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile & Resume — Hireloop" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Profile & Resume" description="Manage your account and resume." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Account details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate font-medium text-foreground">{user?.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-medium text-foreground">{user?.userId ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="font-medium text-foreground">{user?.premium ? "Premium" : "Free"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Resume</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a PDF or DOC. We store it securely and use it for AI grading.
          </p>
          <div className="mt-4">
            <ResumeUpload />
          </div>
        </section>
      </div>
    </div>
  );
}
