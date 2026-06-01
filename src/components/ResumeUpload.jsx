import { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadResume } from "@/lib/api-client";
import { authStore } from "@/lib/auth-store";
import { useAuth } from "@/lib/use-auth";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED = [".pdf", ".doc", ".docx"];

export function ResumeUpload() {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState(user?.resumeUrl ?? null);

  const pickFile = (f) => {
    if (!f) return;
    const ext = "." + (f.name.split(".").pop() ?? "").toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      toast.error("Please choose a PDF, DOC or DOCX file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("File is too large (max 10MB).");
      return;
    }
    setFile(f);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const { publicUrl: url } = await uploadResume(file, setProgress);
      setPublicUrl(url);
      if (url) authStore.patchUser({ resumeUrl: url });
      toast.success("Resume uploaded successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pickFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-secondary/50"
      >
        <UploadCloud className="h-8 w-8 text-primary" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Click to browse or drag a file here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, DOC or DOCX · up to 10MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="sr-only"
          aria-label="Resume file"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {file && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      )}

      {uploading && (
        <div>
          <Progress value={progress} />
          <p className="mt-1 text-right text-xs text-muted-foreground">{progress}%</p>
        </div>
      )}

      {publicUrl && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Resume on file</p>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 break-all text-sm text-primary hover:underline"
            >
              View resume <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
