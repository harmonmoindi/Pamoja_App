import { createBrowserRouter } from "react-router";
import { publicRoutes } from "./publicRoutes";
import { donorRoutes } from "./donorRoutes";
import { beneficiaryRoutes } from "./beneficiaryRoutes";
import { agencyRoutes } from "./agencyRoutes";
import { adminRoutes } from "./adminRoutes";

// Owned by the Foundation owner. Portal routes are open for now; ProtectedRoute
// (role-based access) wraps them when authentication is added.
export const router = createBrowserRouter([
  publicRoutes,
  donorRoutes,
  beneficiaryRoutes,
  agencyRoutes,
  adminRoutes,
]);
