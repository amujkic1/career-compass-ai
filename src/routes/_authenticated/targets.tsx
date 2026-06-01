import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  Target as TargetIcon,
  Pencil,
  Trash2,
  Gauge,
  MessagesSquare,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { JobTargetEditor } from "@/components/JobTargetEditor";
import { GradeReportView } from "@/components/GradeReportView";
import { InterviewQuestionsView } from "@/components/InterviewQuestionsView";
import { api, ApiError } from "@/lib/api-client";
import { useTargets, useUpdateTarget, useDeleteTarget } from "@/lib/use-targets";
import type { JobTarget, ResumeGradeReport, InterviewQuestionSet, ScrapedJobResponse } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/targets")({
  head: () => ({ meta: [{ title: "Job Targets — Hireloop" }] }),
  component: TargetsPage,
});

function TargetsPage() {
  const { data: targets = [], isLoading } = useTargets();
  const updateTarget = useUpdateTarget();
  const deleteTarget = useDeleteTarget();

  const [editing, setEditing] = useState<JobTarget | null>(null);
  const [viewing, setViewing] = useState<JobTarget | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [grade, setGrade] = useState<{ target: JobTarget; report: ResumeGradeReport } | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestionSet | null>(null);

  const gradeMutation = useMutation({
    mutationFn: (t: JobTarget) => api.gradeResume(t.id),
    onSuccess: (report, t) => setGrade({ target: t, report }),
    onError: (err) => {
      const msg =
        err instanceof ApiError && err.status === 400
          ? "Upload a resume first to grade it."
          : err instanceof Error
            ? err.message
            : "Could not grade resume";
      toast.error(msg);
    },
  });

  const questionsMutation = useMutation({
    mutationFn: (t: JobTarget) => api.interviewQuestions(t.id),
    onSuccess: (set) => setQuestions(set),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not generate questions"),
  });

  const saveEdit = (value: ScrapedJobResponse) => {
    if (!editing) return;
    updateTarget.mutate(
      { id: editing.id, payload: value },
      {
        onSuccess: () => {
          toast.success("Target updated");
          setEditing(null);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Could not update target"),
      },
    );
  };

  const confirmDelete = () => {
    if (deleteId == null) return;
    deleteTarget.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Target deleted");
        setDeleteId(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Could not delete target");
        setDeleteId(null);
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Job Targets"
        description="Saved roles you can grade and prep for."
        action={
          <Button asChild>
            <Link to="/scrape">Add target</Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading targets…
        </div>
      ) : targets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <TargetIcon className="h-6 w-6" />
          </span>
          <p className="mt-4 font-semibold text-foreground">No job targets yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Scrape a job posting to save your first target.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/scrape">Scrape a job</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {targets.map((t) => (
            <div key={t.id} className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-foreground">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.company}
                    {t.createdAt
                      ? ` · ${new Date(t.createdAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => gradeMutation.mutate(t)}
                  disabled={gradeMutation.isPending}
                >
                  {gradeMutation.isPending && gradeMutation.variables?.id === t.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Gauge className="h-4 w-4" />
                  )}
                  Grade my resume
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => questionsMutation.mutate(t)}
                  disabled={questionsMutation.isPending}
                >
                  {questionsMutation.isPending && questionsMutation.variables?.id === t.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessagesSquare className="h-4 w-4" />
                  )}
                  Interview questions
                </Button>
                <Button size="sm" variant="outline" onClick={() => setViewing(t)}>
                  View details
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(t)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteId(t.id)}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View details */}
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{viewing?.company}</p>
          <div className="mt-3 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Description</h4>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {viewing?.description}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Requirements</h4>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {viewing?.requirements}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      {editing && (
        <JobTargetEditor
          open={!!editing}
          onOpenChange={(v) => !v && setEditing(null)}
          initial={{
            title: editing.title,
            company: editing.company,
            description: editing.description,
            requirements: editing.requirements,
          }}
          title="Edit job target"
          saving={updateTarget.isPending}
          onSave={saveEdit}
        />
      )}

      {/* Grade report */}
      <Dialog open={!!grade} onOpenChange={(v) => !v && setGrade(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resume grade</DialogTitle>
          </DialogHeader>
          {grade && (
            <GradeReportView
              report={grade.report}
              jobTitle={grade.target.title}
              company={grade.target.company}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Interview questions */}
      <Dialog open={!!questions} onOpenChange={(v) => !v && setQuestions(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Interview questions</DialogTitle>
          </DialogHeader>
          {questions && <InterviewQuestionsView set={questions} />}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteId != null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job target?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
