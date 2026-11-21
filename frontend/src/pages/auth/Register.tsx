import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
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
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { dashboardPath, useAuth } from "@/context/AuthContext";
import { counties } from "@/data/constants/counties";
import { errorMessage } from "@/lib/errors";
import { User } from "@/types/user";

type RegisterRole = "donor" | "beneficiary" | "agency";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<RegisterRole>("donor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [county, setCounty] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<User | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        county: county || undefined,
        organizationName: role === "agency" ? organizationName.trim() || undefined : undefined,
      });
      setCreated(user);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  // Success screen
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

  return (
    <AuthLayout>
      <div className="auth-form">
        <span className="mobile-auth-logo">
          <HeartHandshake /> PAMOJA
        </span>
        <h1>Join the Pamoja network</h1>
        <p>Choose how you want to participate.</p>

        <div className="role-options">
          <button type="button" className={role === "donor" ? "selected" : ""} onClick={() => setRole("donor")}>
            <HandHeart />
            <b>Donor</b>
            <small>I want to support causes</small>
          </button>
          <button
            type="button"
            className={role === "beneficiary" ? "selected" : ""}
            onClick={() => setRole("beneficiary")}
          >
            <UsersRound />
            <b>Beneficiary</b>
            <small>I need assistance</small>
          </button>
          <button type="button" className={role === "agency" ? "selected" : ""} onClick={() => setRole("agency")}>
            <Building2 />
            <b>Agency</b>
            <small>We coordinate assistance</small>
          </button>
        </div>

        <form onSubmit={submit}>
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
          {role === "agency" && (
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
                minLength={8}
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShow(!show)} aria-label="Show or hide password">
                {show ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>
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
          {error && (
            <div className="auth-error" role="alert">
              <CircleAlert />
              <span>{error}</span>
            </div>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Creating account…" : "Create account"} <ArrowRight />
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
        <div className="demo-notice">
          Demonstration platform. Do not enter real credentials or personal information.
        </div>
      </div>
    </AuthLayout>
  );
}
