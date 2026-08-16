import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@housemates/shared-ui/sonner";
import "./index.css";
import App from "./App";
import { AuthProvider } from "@/lib/auth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  </StrictMode>,
);
