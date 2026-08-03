import { Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import PostListing from "./pages/PostListing";
import Messages from "./pages/Messages";
import Conversation from "./pages/Conversation";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";
import { AppLayout } from "@/components/housemate/AppLayout";
import { AdminLayout } from "@/components/housemate/AdminLayout";
import { ProtectedRoute } from "@/components/housemate/ProtectedRoute";
import { AdminRoute } from "@/components/housemate/AdminRoute";

export const routers = [
  { path: "/login", name: "login", element: <Login /> },
  { path: "/signup", name: "signup", element: <Signup /> },
  { path: "/", name: "home", element: <AppLayout><Index /></AppLayout> },
  { path: "/browse", name: "browse", element: <AppLayout><Browse /></AppLayout> },
  { path: "/listings/:id", name: "listing", element: <AppLayout><ListingDetail /></AppLayout> },
  { path: "/post", name: "post", element: <AppLayout><ProtectedRoute><PostListing /></ProtectedRoute></AppLayout> },
  { path: "/messages", name: "messages", element: <AppLayout><ProtectedRoute><Messages /></ProtectedRoute></AppLayout> },
  { path: "/messages/:id", name: "conversation", element: <AppLayout><ProtectedRoute><Conversation /></ProtectedRoute></AppLayout> },
  { path: "/dashboard", name: "dashboard", element: <AppLayout><ProtectedRoute><Dashboard /></ProtectedRoute></AppLayout> },
  { path: "/profile", name: "profile", element: <AppLayout><ProtectedRoute><Profile /></ProtectedRoute></AppLayout> },
  { path: "/admin", name: "admin-index", element: <Navigate to="/admin/users" replace /> },
  { path: "/admin/users", name: "admin-users", element: <AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute> },
  { path: "/admin/reports", name: "admin-reports", element: <AdminRoute><AdminLayout><AdminReports /></AdminLayout></AdminRoute> },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  { path: "*", name: "404", element: <AppLayout><NotFound /></AppLayout> },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
