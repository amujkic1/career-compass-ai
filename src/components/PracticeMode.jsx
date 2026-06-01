import { useEffect, useRef, useState } from "react";
import { Timer, ChevronLeft, ChevronRight, X, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function PracticeMode({ jobId, questions, onClose }) {
  const storageKey = `hireloop.practice.${jobId}`;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) return JSON.parse(raw);
      } catch {
        /* ignore */
      }
    }
    return questions.map(() => "");
  });
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Reset timer when moving to a new question.
  useEffect(() => {
    setSeconds(0);
  }, [index]);

  const current = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  const updateAnswer = (value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const save = () => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(answers));
      toast.success("Answers saved locally");
    } catch {
      toast.error("Could not save answers");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
            <Timer className="h-4 w-4 text-primary" /> {formatTime(seconds)}
          </span>
          <span className="text-sm text-muted-foreground">
            Question {index + 1} of {questions.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Exit practice">
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="px-4 pt-3 sm:px-6">
        <Progress value={progress} />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{current.question}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Concept: {current.conceptEvaluated}
          </span>
        </div>
        <p className="mt-3 rounded-lg border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
          💡 {current.structuralHint}
        </p>

        <label htmlFor="answer" className="mt-6 text-sm font-medium text-foreground">
          Your answer
        </label>
        <Textarea
          id="answer"
          value={answers[index] ?? ""}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder="Speak it out loud, then jot down your structured answer here…"
          className="mt-2 min-h-40 flex-1"
        />
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-6">
        <Button
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button variant="secondary" onClick={save}>
          <Save className="h-4 w-4" /> Save answers
        </Button>
        <Button
          onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          disabled={index === questions.length - 1}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}
