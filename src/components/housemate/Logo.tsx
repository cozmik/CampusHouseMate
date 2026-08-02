import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
        <Home className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="text-lg font-extrabold tracking-tight">
          House<span className="text-gradient">Mate</span>
        </span>
      )}
    </Link>
  );
}
