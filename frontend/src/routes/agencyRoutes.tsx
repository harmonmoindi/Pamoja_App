import { Navigate, type RouteObject } from "react-router";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { page } from "./lazyPage";

// Agency Portal routes
export const agencyRoutes: RouteObject = {
  path: "/agency",
  element: <PortalLayout role="agency" />,
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    { path: "dashboard", element: page("agency/AgencyDashboard") },
    { path: "requests", element: page("agency/AssistanceRequests") },
    { path: "assessment", element: page("agency/NeedsAssessment") },
    { path: "matching", element: page("agency/ResourceMatching") },
    { path: "inventory", element: page("agency/Inventory") },
    { path: "tasks", element: page("agency/TaskBoard") },
    { path: "deliveries", element: page("agency/Deliveries") },
    { path: "centres", element: page("agency/CollectionCentresManage") },
    { path: "appointments", element: page("agency/AppointmentsManage") }
  ]
};