import { Link } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, to = "/" }) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 font-display text-lg font-700 tracking-tight",
        className,
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
        <Target className="h-5 w-5" />
      </span>
      <span className="font-semibold">Hireloop</span>
    </Link>
  );
}
