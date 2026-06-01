import { useState } from "react";
import { Copy, Printer, Play, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PracticeMode } from "@/components/PracticeMode";

export function InterviewQuestionsView({ set }) {
  const [favorites, setFavorites] = useState(new Set());
  const [practice, setPractice] = useState(false);

  const toggleFav = (i) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const copyOne = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Question copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <p className="text-sm text-muted-foreground">
          {set.questions.length} questions for{" "}
          <span className="font-medium text-foreground">{set.jobTitle}</span>
          {set.company ? ` @ ${set.company}` : ""}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Export PDF
          </Button>
          <Button size="sm" onClick={() => setPractice(true)}>
            <Play className="h-4 w-4" /> Practice mode
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {set.questions.map((q, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-foreground">
                {i + 1}. {q.question}
              </h3>
              <div className="flex shrink-0 gap-1 no-print">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle favorite"
                  onClick={() => toggleFav(i)}
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      favorites.has(i) ? "fill-accent text-accent" : "text-muted-foreground",
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Copy question"
                  onClick={() => copyOne(q.question)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {q.conceptEvaluated}
              </span>
            </div>
            <p className="mt-3 rounded-lg border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
              💡 {q.structuralHint}
            </p>
          </div>
        ))}
      </div>

      {practice && (
        <PracticeMode
          jobId={set.jobId}
          questions={set.questions}
          onClose={() => setPractice(false)}
        />
      )}
    </div>
  );
}
