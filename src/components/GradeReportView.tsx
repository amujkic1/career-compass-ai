import { Copy, Printer, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResumeGradeReport } from "@/lib/types";

function band(score: number) {
  if (score >= 85)
    return { label: "Excellent", color: "text-grade-excellent", ring: "stroke-grade-excellent", bg: "bg-grade-excellent/10" };
  if (score >= 70)
    return { label: "Good", color: "text-grade-good", ring: "stroke-grade-good", bg: "bg-grade-good/10" };
  if (score >= 50)
    return { label: "Okay", color: "text-grade-ok", ring: "stroke-grade-ok", bg: "bg-grade-ok/10" };
  return { label: "Needs work", color: "text-grade-poor", ring: "stroke-grade-poor", bg: "bg-grade-poor/10" };
}

function ScoreRing({ score }: { score: number }) {
  const b = band(score);
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, score)) / 100) * c;
  return (
    <div className={cn("relative flex h-32 w-32 items-center justify-center rounded-full", b.bg)}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} className="fill-none stroke-border" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className={cn("fill-none transition-all", b.ring)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="text-center">
        <span className={cn("font-display text-3xl font-bold", b.color)}>{score}</span>
        <span className="block text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function ListBlock({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: typeof CheckCircle2;
  title: string;
  items: string[];
  tone: "good" | "bad" | "info";
}) {
  const toneClass =
    tone === "good"
      ? "text-grade-excellent"
      : tone === "bad"
        ? "text-destructive"
        : "text-accent-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className={cn("h-4 w-4", toneClass)} />
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">None reported.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground">
              <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", `bg-current ${toneClass}`)} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function GradeReportView({
  report,
  jobTitle,
  company,
}: {
  report: ResumeGradeReport;
  jobTitle?: string;
  company?: string;
}) {
  const b = band(report.matchingScore);

  const copyReport = async () => {
    const text = [
      `Resume grade${jobTitle ? ` for ${jobTitle}${company ? ` @ ${company}` : ""}` : ""}`,
      `Score: ${report.matchingScore}/100 (${b.label})`,
      ``,
      `Summary: ${report.summary}`,
      ``,
      `Matched skills: ${report.matchedSkills.join(", ") || "—"}`,
      `Critical gaps: ${report.criticalGaps.join(", ") || "—"}`,
      ``,
      `Improvements:`,
      ...report.actionableImprovements.map((i) => `- ${i}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Report copied to clipboard");
    } catch {
      toast.error("Could not copy report");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card p-6 text-center sm:flex-row sm:text-left">
        <ScoreRing score={report.matchingScore} />
        <div className="flex-1">
          <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-semibold", b.bg, b.color)}>
            {b.label} match
          </span>
          {jobTitle && (
            <p className="mt-2 text-sm text-muted-foreground">
              {jobTitle}
              {company ? ` · ${company}` : ""}
            </p>
          )}
          <p className="mt-2 text-sm leading-relaxed text-foreground">{report.summary}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start no-print">
            <Button variant="outline" size="sm" onClick={copyReport}>
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Save / Print PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ListBlock icon={CheckCircle2} title="Matched skills" items={report.matchedSkills} tone="good" />
        <ListBlock icon={AlertTriangle} title="Critical gaps" items={report.criticalGaps} tone="bad" />
      </div>
      <ListBlock
        icon={Lightbulb}
        title="Actionable improvements"
        items={report.actionableImprovements}
        tone="info"
      />
    </div>
  );
}
