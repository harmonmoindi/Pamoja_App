import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import {
  ArrowRight,
  Building2,
  CircleAlert,
  Eye,
  EyeOff,
  HandHeart,
  HeartHandshake,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { dashboardPath, useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/errors";
import { UserRole } from "@/types/user";

// Same password the back-end seed gives every demo account (SEED_PASSWORD, default below).
// Demo only: remove this and the demo accounts section before any real deployment.
const DEMO_PASSWORD = "Pamoja#2026";

const demoAccounts: { role: UserRole; label: string; description: string; email: string }[] = [
  { role: "donor", label: "Donor", description: "Discover needs, pledge resources and donate", email: "amina.hassan@example.org" },
  { role: "beneficiary", label: "Beneficiary", description: "Request assistance and track delivery", email: "grace.wanjiku@example.org" },
  { role: "agency", label: "Agency", description: "Assess requests and coordinate deliveries", email: "daniel.mutua@example.org" },
  { role: "admin", label: "Administrator", description: "Verify agencies and monitor the platform", email: "admin@example.org" },
];

const roleIcons: Record<UserRole, typeof HandHeart> = {
  donor: HandHeart,
  beneficiary: UsersRound,
  agency: Building2,
  admin: ShieldCheck,
};

export default function SignIn() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in: go straight to the dashboard.
  if (user) return <Navigate to={dashboardPath(user.role)} replace />;

  async function signIn(emailValue: string, passwordValue: string) {
    setError("");
    setBusy(true);
    try {
      const signedIn = await login(emailValue.trim(), passwordValue);
      navigate(dashboardPath(signedIn.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void signIn(email, password);
  }

  return (
    <AuthLayout>
      <div className="auth-form">
        <span className="mobile-auth-logo">
          <HeartHandshake /> PAMOJA
        </span>
        <h1>Welcome back</h1>
        <p>Sign in to continue to your stakeholder workspace.</p>

        <form onSubmit={submit}>
          <label>
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.org"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <div className="password">
              <input
                required
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShow(!show)} aria-label="Show or hide password">
                {show ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>
          {error && (
            <div className="auth-error" role="alert">
              <CircleAlert />
              <span>{error}</span>
            </div>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"} <ArrowRight />
          </Button>
        </form>

        <section className="demo-account-selector" aria-labelledby="demo-account-title">
          <div className="demo-selector-heading">
            <span>Fictional accounts</span>
            <h2 id="demo-account-title">Explore Pamoja: Demo Accounts</h2>
            <p>Choose a role to sign in instantly. These accounts come from the seeded database.</p>
          </div>
          <div className="demo-account-grid">
            {demoAccounts.map((account) => {
              const Icon = roleIcons[account.role];
              return (
                <article className="demo-account-card" key={account.role}>
                  <span className={`demo-role-icon ${account.role}`}>
                    <Icon />
                  </span>
                  <div>
                    <h3>{account.label}</h3>
                    <p>{account.description}</p>
                    <small>{account.email}</small>
                  </div>
                  <Button variant="outline" disabled={busy} onClick={() => void signIn(account.email, DEMO_PASSWORD)}>
                    Try Demo
                  </Button>
                </article>
              );
            })}
          </div>
        </section>

        <p className="auth-switch">
          New to Pamoja? <Link to="/register">Create account</Link>
        </p>
        <div className="demo-notice">
          Demonstration platform. Do not enter real credentials or personal information.
        </div>
      </div>
    </AuthLayout>
  );
}
