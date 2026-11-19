import { Routes, Route } from "react-router";

import AgencyLayout from "../components/agency/AgencyLayout";
import AgencyDashboard from "../pages/agency/AgencyDashboard";
import AssistanceRequests from "../pages/agency/AssistanceRequests";
import NeedsAssessment from "../pages/agency/NeedsAssessment";
import ResourceMatching from "../pages/agency/ResourceMatching";
import Inventory from "../pages/agency/Inventory";
import CollectionCentresManage from "../pages/agency/CollectionCentresManage";
import AppointmentsManage from "../pages/agency/AppointmentsManage";
import Deliveries from "../pages/agency/Deliveries";
import TaskBoard from "../pages/agency/TaskBoard";
import { Navigate, RouteObject } from "react-router";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { page } from "./lazyPage";

// Owned by the Agency dev. Add new agency routes here only.
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
    { path: "appointments", element: page("agency/AppointmentsManage") },
  ],
};


export default function AgencyRoutes() {
  return (
    <Routes>
      <Route path="/agency" element={<AgencyLayout />}>

        <Route
          index
          element={<AgencyDashboard />}
        />

        <Route
          path="requests"
          element={<AssistanceRequests />}
        />

        <Route
          path="assessments"
          element={<NeedsAssessment />}
        />

        <Route
          path="matching"
          element={<ResourceMatching />}
        />

        <Route
          path="inventory"
          element={<Inventory />}
        />

        <Route
          path="centres"
          element={<CollectionCentresManage />}
        />

        <Route
          path="appointments"
          element={<AppointmentsManage />}
        />

        <Route
          path="deliveries"
          element={<Deliveries />}
        />

        <Route
          path="tasks"
          element={<TaskBoard />}
        />

      </Route>
    </Routes>
  );
}
