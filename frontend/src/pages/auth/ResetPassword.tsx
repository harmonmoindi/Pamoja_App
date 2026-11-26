import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function ResetPassword() {
  return (
    <AuthLayout>
      <div className="auth-form">
        <h1>Reset your password</h1>
        <p>This link is not active in the demonstration version of Pamoja.</p>
        <div className="demo-notice" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Info size={18} />
          <span>Password resets need email delivery, which is switched off here. Please sign in with a demo account.</span>
        </div>
        <Button to="/signin">
          Go to sign in <ArrowRight />
        </Button>
      </div>
    </AuthLayout>
  );
}
