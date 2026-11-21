import { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

/** Full-screen layout shared by the sign-in and register pages. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <div className="auth-visual">
        <Logo light />
        <div>
          <span className="eyebrow">One platform. Shared purpose.</span>
          <h1>Humanitarian action becomes stronger when we act together.</h1>
          <p>Coordinate needs, commitments, and outcomes with transparency at every step.</p>
        </div>
        <small>Photograph by Oscar Omondi on Unsplash</small>
      </div>
      <div className="auth-panel">{children}</div>
    </main>
  );
}
