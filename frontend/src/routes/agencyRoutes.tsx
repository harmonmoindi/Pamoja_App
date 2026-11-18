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