import { Navigate, RouteObject } from "react-router";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { page } from "./lazyPage";

// Owned by the Donor dev. Add new donor routes here only.
export const donorRoutes: RouteObject = {
  path: "/donor",
  element: <PortalLayout role="donor" />,
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    { path: "dashboard", element: page("donor/DonorDashboard") },
    { path: "donate/:id", element: page("donor/MpesaDonation") },
    { path: "donations", element: page("donor/DonationHistory") },
    { path: "pledges", element: page("donor/MyPledges") },
    { path: "notifications", element: page("donor/Notifications") },
    { path: "appointments", element: page("donor/Appointments") },
    { path: "appointments/book/:id", element: page("donor/AppointmentBooking") },
    { path: "preferences", element: page("donor/Preferences") },
  ],
};
