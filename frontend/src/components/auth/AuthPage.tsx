import { CSSProperties, FormEvent, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import {
  ArrowRight,
  Building2,
  Check,
  CircleAlert,
  Clock3,
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
import { counties } from "@/data/constants/counties";
import { errorMessage } from "@/lib/errors";
import { User, UserRole } from "@/types/user";

type Mode = "signin" | "register";

const roles: { value: UserRole; label: string; hint: string; Icon: typeof HandHeart; tag?: string }[] = [
  { value: "donor", label: "Donor", hint: "I want to support causes", Icon: HandHeart },
  { value: "beneficiary", label: "Beneficiary", hint: "I need assistance", Icon: UsersRound },
  { value: "agency", label: "Agency", hint: "We coordinate assistance", Icon: Building2 },
  { value: "admin", label: "Admin", hint: "Platform administration", Icon: ShieldCheck, tag: "Not in live site" },
];

const roleLabel = (role: UserRole) => roles.find((r) => r.value === role)?.label ?? role;

const tagStyle: CSSProperties = {
  display: "inline-block",
  marginTop: 6,
  padding: "2px 7px",
  borderRadius: 999,
  background: "#fff4d6",
  color: "#8a5a00",
  fontSize: 9.5,
  fontWeight: 700,
  fontStyle: "normal",
  letterSpacing: 0.2,
};

/**
 * One page for signing in and creating an account, for every portal.
 * /signin opens it on "Sign in"; /register (the "Get started" button) opens it on "Create account".
 */
export function AuthPage({ initialMode }: { initialMode: Mode }) {
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const queryRole = params.get("role");
  const startRole: UserRole = roles.some((r) => r.value === queryRole) ? (queryRole as UserRole) : "donor";

  const [mode, setMode] = useState<Mode>(startRole === "admin" ? "signin" : initialMode);
  const [role, setRole] = useState<UserRole>(startRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [county, setCounty] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<User | null>(null);

  // Already signed in: go straight to the dashboard (but not in the middle of signing in or just after registering).
  if (user && !busy && !created) return <Navigate to={dashboardPath(user.role)} replace />;

  const isAdmin = role === "admin";

  function chooseRole(next: UserRole) {
    setRole(next);
    setError("");
    if (next === "admin") setMode("signin"); // administrator accounts cannot be created here
  }

  function chooseMode(next: Mode) {
    setMode(next);
    setError("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signin") {
        const signedIn = await login(email.trim(), password);
        if (signedIn.role !== role) {
          // The chosen role does not match this account: sign out again and explain.
          logout();
          setError(`This is a ${roleLabel(signedIn.role)} account. Choose "${roleLabel(signedIn.role)}" above to sign in.`);
          return;
        }
        navigate(dashboardPath(signedIn.role), { replace: true });
      } else {
        if (role === "admin") return;
        const newUser = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          county: county || undefined,
          organizationName: role === "agency" ? organizationName.trim() || undefined : undefined,
        });
        setCreated(newUser);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  // ---- Success screen after creating an account
  if (created) {
    const isAgency = created.role === "agency";
    return (
      <AuthLayout>
        <div className="auth-form registration-success">
          <div className="success-mark">
            <Check />
          </div>
          <span className="eyebrow">Registration complete</span>
          <h1>{isAgency ? "Application received" : "Welcome to Pamoja"}</h1>
          <p>
            {isAgency
              ? "Your organization has been created with Pending Verification status. An administrator must review it before it is verified."
              : `Your ${created.role} account is ready.`}
          </p>
          {isAgency && (
            <div className="pending-verification">
              <Clock3 />
              <div>
                <b>Pending Verification</b>
                <small>No verification or administrator privileges have been granted.</small>
              </div>
            </div>
          )}
          <Button onClick={() => navigate(dashboardPath(created.role), { replace: true })}>
            Continue to your dashboard <ArrowRight />
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // ---- Sign in / create account
  return (
    <AuthLayout>
      <div className="auth-form">
        <span className="mobile-auth-logo">
          <HeartHandshake /> PAMOJA
        </span>
        <h1>{mode === "signin" ? "Welcome back" : "Join the Pamoja network"}</h1>
        <p>
          {mode === "signin"
            ? "Choose your role, then sign in to your workspace."
            : "Choose how you want to participate."}
        </p>

        <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
          <Button variant={mode === "signin" ? "primary" : "outline"} onClick={() => chooseMode("signin")}>
            Sign in
          </Button>
          <Button
            variant={mode === "register" ? "primary" : "outline"}
            onClick={() => chooseMode("register")}
            disabled={isAdmin}
          >
            Create account
          </Button>
        </div>

        <div className="role-options" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))" }}>
          {roles.map(({ value, label, hint, Icon, tag }) => (
            <button
              type="button"
              key={value}
              className={role === value ? "selected" : ""}
              onClick={() => chooseRole(value)}
            >
              <Icon />
              <b>{label}</b>
              <small>{hint}</small>
              {tag && <em style={tagStyle}>{tag}</em>}
            </button>
          ))}
        </div>

        {isAdmin && (
          <p style={{ fontSize: 12, color: "var(--muted)", margin: "10px 0 0" }}>
            Administrator accounts are created by the platform team, so there is no sign-up for this role.
          </p>
        )}

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Full name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />
            </label>
          )}
          {mode === "register" && role === "agency" && (
            <label>
              Organization name
              <input
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Your organization"
              />
            </label>
          )}
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
                minLength={mode === "register" ? 8 : undefined}
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
              <button type="button" onClick={() => setShow(!show)} aria-label="Show or hide password">
                {show ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>
          {mode === "register" && (
            <label>
              County (optional)
              <select value={county} onChange={(e) => setCounty(e.target.value)}>
                <option value="">Select your county</option>
                {counties.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && (
            <div className="auth-error" role="alert">
              <CircleAlert />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"} <ArrowRight />
          </Button>
        </form>

        <p className="auth-switch">
          {mode === "signin" ? (
            <>
              New to Pamoja? <Link to="/register">Create account</Link>
            </>
          ) : (
            <>
              Already have an account? <Link to="/signin">Sign in</Link>
            </>
          )}
        </p>
        <div className="demo-notice">
          Demonstration platform. Do not enter real credentials or personal information.
        </div>
      </div>
    </AuthLayout>
  );
}
