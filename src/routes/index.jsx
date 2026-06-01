import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, FileText, Gauge, MessagesSquare, Link2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { authStore } from "@/lib/auth-store";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && authStore.isAuthenticated()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Hireloop — Land the job with AI resume intelligence" },
      {
        name: "description",
        content:
          "Scrape any job post, grade your resume against it, and generate tailored interview questions in seconds.",
      },
      { property: "og:title", content: "Hireloop — AI resume intelligence" },
      {
        property: "og:description",
        content:
          "Scrape any job post, grade your resume against it, and generate tailored interview questions.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Link2,
    title: "Scrape any job post",
    body: "Paste a posting URL and get clean, structured title, company, description and requirements.",
  },
  {
    icon: Gauge,
    title: "Grade your resume",
    body: "AI scores your resume 0–100 against each target with matched skills and critical gaps.",
  },
  {
    icon: MessagesSquare,
    title: "Interview questions",
    body: "Generate tailored questions with the concept evaluated and a structural hint for each.",
  },
  {
    icon: FileText,
    title: "Practice mode",
    body: "Run questions one-by-one with a timer and record your answers locally to rehearse.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get started</Link>
          </Button>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-10 md:grid-cols-2 md:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              AI-powered career toolkit
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
              Tune your resume to every job you want.
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Hireloop scrapes job posts, grades your resume against them, and builds interview
              questions tailored to each role — so you apply with confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/register">
                  Start free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/15 to-accent/15 blur-2xl" />
            <img
              src={heroImage}
              alt="Resume being analyzed and graded into a rising growth chart"
              width={1024}
              height={1024}
              className="w-full rounded-2xl border border-border shadow-elegant"
            />
          </div>
        </section>

        <section className="border-t border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Everything you need to apply smarter
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-elegant"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hireloop. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
