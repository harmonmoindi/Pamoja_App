import { ArrowRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { dashboardPath, useAuth } from "@/context/AuthContext";

export default function PendingVerification() {
  const { user } = useAuth();
  const pending = user?.status === "pending";

  return (
    <AuthLayout>
      <div className="auth-form registration-success">
        <span className="eyebrow">Account status</span>
        <h1>{pending ? "Verification pending" : "Your account is active"}</h1>
        <p>
          {pending
            ? "An administrator is reviewing your organization. You can sign in and look around, but some actions stay limited until you are verified."
            : user
              ? "There is nothing waiting for review on your account."
              : "Sign in to see the status of your application."}
        </p>
        {pending && (
          <div className="pending-verification">
            <Clock3 />
            <div>
              <b>Pending Verification</b>
              <small>No verification or administrator privileges have been granted yet.</small>
            </div>
          </div>
        )}
        <Button to={user ? dashboardPath(user.role) : "/signin"}>
          {user ? "Go to your dashboard" : "Sign in"} <ArrowRight />
        </Button>
      </div>
    </AuthLayout>
  );
}
