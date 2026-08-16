import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@housemates/shared-ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
        <Compass className="h-6 w-6 text-teal-300" />
      </div>
      <p className="font-display text-6xl font-bold tracking-tight text-gradient">404</p>
      <h1 className="mt-3 font-display text-xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button className="mt-6" asChild>
        <Link to="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>
      </Button>
    </div>
  );
}
