import { RouteObject } from "react-router";
import { page } from "./lazyPage";

// Sign in and register use their own full-screen layout, not the public header and footer.
export const authRoutes: RouteObject[] = [
  { path: "/signin", element: page("auth/SignIn") },
  { path: "/register", element: page("auth/Register") },
  { path: "/forgot-password", element: page("auth/ForgotPassword") },
  { path: "/reset-password", element: page("auth/ResetPassword") },
  { path: "/pending-verification", element: page("auth/PendingVerification") },
  { path: "/agency-application", element: page("auth/AgencyApplication") },
];