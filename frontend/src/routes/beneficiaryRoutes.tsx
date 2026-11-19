import { Navigate, RouteObject } from "react-router";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { page } from "./lazyPage";

// Owned by the Beneficiary dev. Add new beneficiary routes here only.
// Note: the sidebar links to /beneficiary/appointments but no page exists for it yet.
export const beneficiaryRoutes: RouteObject = {
  path: "/beneficiary",
  element: <PortalLayout role="beneficiary" />,
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    { path: "dashboard", element: page("beneficiary/BeneficiaryDashboard") },
    { path: "request", element: page("beneficiary/RequestWizard") },
    { path: "requests", element: page("beneficiary/MyRequests") },
    { path: "tracking", element: page("beneficiary/RequestTracking") },
    { path: "receipt", element: page("beneficiary/ConfirmReceipt") },
    { path: "notifications", element: page("beneficiary/Notifications") },
  ],
};
