import { createFileRoute, Link } from "@tanstack/react-router";
import { Link2, Target, FileText, Gauge, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { useTargets } from "@/lib/use-targets";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Hireloop" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: targets = [] } = useTargets();
  const hasResume = !!user?.resumeUrl;

  const stats = [
    { label: "Saved job targets", value: targets.length, icon: Target },
    { label: "Resume status", value: hasResume ? "Uploaded" : "Missing", icon: FileText },
    { label: "Plan", value: user?.premium ? "Premium" : "Free", icon: Gauge },
  ];

  const actions = [
    { to: "/scrape", label: "Scrape a job URL", desc: "Extract job details", icon: Link2 },
    { to: "/profile", label: "Upload resume", desc: "PDF or DOC", icon: FileText },
    { to: "/targets", label: "Grade & interview", desc: "Run AI on targets", icon: Gauge },
  ] as const;

  return (
    <div>
      <PageHeader
        title={`Welcome${user?.email ? `, ${user.email.split("@")[0]}` : ""}`}
        description="Your job search command center."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {!hasResume && (
        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-foreground">Upload your resume to unlock grading</p>
            <p className="text-sm text-muted-foreground">
              AI grading needs a resume on file.
            </p>
          </div>
          <Button asChild>
            <Link to="/profile">Upload now <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      )}

      <h2 className="mt-8 mb-3 text-lg font-semibold text-foreground">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <a.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 font-semibold text-foreground">{a.label}</p>
            <p className="text-sm text-muted-foreground">{a.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
