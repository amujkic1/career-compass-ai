import { useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AuthShell, FieldError } from "@/components/AuthShell";
import { api, ApiError } from "@/lib/api-client";
import { authStore } from "@/lib/auth-store";

const registerSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && authStore.isAuthenticated()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Create account — Hireloop" },
      { name: "description", content: "Create a Hireloop account to start grading your resume." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [premium, setPremium] = useState(false);
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: () =>
      api.register({
        email: email.trim(),
        password,
        premium,
        resumeUrl: null,
      }),
    onSuccess: (res) => {
      authStore.setSession(res, { premium });
      toast.success("Account created — welcome to Hireloop!");
      navigate({ to: "/dashboard" });
    },
    onError: (err) => {
      const message =
        err instanceof ApiError && err.status === 409
          ? "An account with this email already exists."
          : err instanceof Error
            ? err.message
            : "Could not create account.";
      toast.error(message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors = {};
      parsed.error.issues.forEach((i) => {
        fieldErrors[i.path[0]] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    mutation.mutate();
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start grading your resume against real job posts."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            placeholder="you@example.com"
          />

          <FieldError message={errors.email} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            placeholder="At least 8 characters"
          />

          <FieldError message={errors.password} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3">
          <div>
            <Label htmlFor="premium" className="cursor-pointer">
              Premium account
            </Label>
            <p className="text-xs text-muted-foreground">Unlock advanced AI evaluation features.</p>
          </div>
          <Switch id="premium" checked={premium} onCheckedChange={setPremium} />
        </div>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
