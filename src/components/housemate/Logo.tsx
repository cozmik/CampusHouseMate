import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const LOGO_SRC = {
  dark: "/brand/hmf-dark.png",
  light: "/brand/hmf-light.png",
  icon: "/brand/hmf-circle.png",
};

export function Logo({
  className,
  compact = false,
  variant = "dark",
}: {
  className?: string;
  compact?: boolean;
  /** "dark" wordmark for light backgrounds, "light" wordmark for dark backgrounds. */
  variant?: "dark" | "light";
}) {
  return (
    <Link to="/" className={cn("flex items-center", className)}>
      {compact ? (
        <img src={LOGO_SRC.icon} alt="Housemates Finder" className="h-9 w-9 rounded-full" />
      ) : (
        <img
          src={variant === "light" ? LOGO_SRC.light : LOGO_SRC.dark}
          alt="Housemates Finder"
          className="h-8 w-auto sm:h-9"
        />
      )}
    </Link>
  );
}
