import { createBrowserRouter, RouteObject } from "react-router";
import { UserRole } from "@/types/user";
import { adminRoutes } from "./adminRoutes";
import { agencyRoutes } from "./agencyRoutes";
import { authRoutes } from "./authRoutes";
import { beneficiaryRoutes } from "./beneficiaryRoutes";
import { donorRoutes } from "./donorRoutes";
import { ProtectedRoute } from "./ProtectedRoute";
import { publicRoutes } from "./publicRoutes";

// Owned by the Foundation owner.
// Every portal is wrapped here, so a user can only open the portal that matches their role.
// Portal devs keep editing only their own route file.
function protect(route: RouteObject, role: UserRole): RouteObject {
  return { ...route, element: <ProtectedRoute role={role}>{route.element}</ProtectedRoute> };
}

export const router = createBrowserRouter([
  publicRoutes,
  ...authRoutes,
  protect(donorRoutes, "donor"),
  protect(beneficiaryRoutes, "beneficiary"),
  protect(agencyRoutes, "agency"),
  protect(adminRoutes, "admin"),
]);
