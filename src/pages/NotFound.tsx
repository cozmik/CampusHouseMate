import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404: route not found:", location.pathname);
  }, [location.pathname]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black text-gradient">404</p>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">The page you’re looking for doesn’t exist or may have moved.</p>
      <Button asChild className="mt-6 bg-gradient-primary"><Link to="/"><Home className="h-4 w-4" />Back home</Link></Button>
    </div>
  );
};

export default NotFound;
