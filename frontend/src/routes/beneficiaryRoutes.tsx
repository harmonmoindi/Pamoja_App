import { Navigate, RouteObject } from "react-router";
import { BeneficiaryLayout } from "@/components/beneficiary/BeneficiaryLayout";
import { page } from "./lazyPage";

// Owned by the Beneficiary dev. Add new beneficiary routes here only.
export const beneficiaryRoutes: RouteObject = {
  path: "/beneficiary",
  element: <BeneficiaryLayout />,
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    { path: "dashboard", element: page("beneficiary/BeneficiaryDashboard") },
    { path: "request", element: page("beneficiary/RequestWizard") },
    { path: "requests", element: page("beneficiary/MyRequests") },
    { path: "requests/:reference", element: page("beneficiary/RequestDetail") },
    { path: "tracking", element: page("beneficiary/RequestTracking") },
    { path: "receipt", element: page("beneficiary/ConfirmReceipt") },
    { path: "notifications", element: page("beneficiary/Notifications") },
    { path: "workspace", element: page("beneficiary/SwitchWorkspace") },
  ],
};
