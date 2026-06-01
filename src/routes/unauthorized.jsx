import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [{ title: "Unauthorized — Hireloop" }, { name: "robots", content: "noindex" }],
  }),
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto w-full max-w-6xl px-6 py-5">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-foreground">You need to sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your session may have expired or you don&apos;t have access to this page. Please sign in
            to continue.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Go home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
