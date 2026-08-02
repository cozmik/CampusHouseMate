import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useApp } from "@/lib/store";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, authReady } = useApp();
  const location = useLocation();
  if (!authReady) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!currentUser) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }
  return <>{children}</>;
}
