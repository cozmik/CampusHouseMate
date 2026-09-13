import { Toaster } from "@housemates/shared-ui/toaster";
import { Toaster as Sonner } from "@housemates/shared-ui/sonner";
import { TooltipProvider } from "@housemates/shared-ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { PostHogProvider } from "@posthog/react";
import { routers } from "./router";
import { AppProvider } from "@/lib/store";
import { DocumentSeo } from "@/components/housemate/DocumentSeo";
import { PostHogIdentify } from "@/components/housemate/PostHogIdentify";
import { POSTHOG_KEY, posthogOptions } from "@/lib/posthog";

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

function AppTree() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <PostHogIdentify />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

const App = () =>
  POSTHOG_KEY ? (
    <PostHogProvider apiKey={POSTHOG_KEY} options={posthogOptions}>
      <AppTree />
    </PostHogProvider>
  ) : (
    <AppTree />
  );

export default App;
