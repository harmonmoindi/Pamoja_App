import { ReactNode } from "react";
import { Navigate } from "react-router";
import { dashboardPath, useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/user";

/**
 * Only lets users with the right role through.
 * Not signed in -> sign-in page.  Wrong role -> their own dashboard.
 * It is applied to every portal in routes/index.tsx, so portal devs do not need to use it.
 *
 * Developer shortcut: add VITE_BYPASS_AUTH=true to your own frontend/.env to open any portal
 * without signing in (for example while your back-end is not running yet).
 * Never set it in a shared or deployed environment.
 */
export function ProtectedRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, loading } = useAuth();

  if (import.meta.env.VITE_BYPASS_AUTH === "true") return <>{children}</>;

  if (loading) {
    return (
      <div className="container" style={{ padding: 32 }}>
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== role) return <Navigate to={dashboardPath(user.role)} replace />;
  return <>{children}</>;
}
