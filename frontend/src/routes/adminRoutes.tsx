import { Navigate, RouteObject } from "react-router";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { page } from "./lazyPage";

// Owned by the Admin dev. Add new admin routes here only.
export const adminRoutes: RouteObject = {
  path: "/admin",
  element: <PortalLayout role="admin" />,
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    { path: "dashboard", element: page("admin/AdminDashboard") },
    { path: "verification", element: page("admin/AgencyVerification") },
    { path: "users", element: page("admin/Users") },
    { path: "requests", element: page("admin/RequestOversight") },
    { path: "duplicates", element: page("admin/DuplicateReview") },
    { path: "audit", element: page("admin/AuditActivity") },
  ],
};
