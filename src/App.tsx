import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { routers } from "./router";
import { AppProvider } from "@/lib/store";
import { DocumentSeo } from "@/components/housemate/DocumentSeo";

const queryClient = new QueryClient();

function AppShell() {
  return (
    <>
      <DocumentSeo />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  { element: <AppShell />, children: routers },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
