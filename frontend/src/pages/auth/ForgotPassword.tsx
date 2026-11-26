import { Link } from "react-router";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <div className="auth-form">
        <h1>Forgot your password?</h1>
        <p>Password reset by email is not available in this demonstration.</p>
        <div className="demo-notice" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Info size={18} />
          <span>
            Use one of the demo accounts on the sign-in page, or create a new test account. Passwords are never
            shown or sent by email.
          </span>
        </div>
        <Button to="/signin">
          Back to sign in <ArrowRight />
        </Button>
        <p className="auth-switch">
          New to Pamoja? <Link to="/register">Create account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
