import { ArrowRight, Building2, ShieldCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/layout/AuthLayout";

const steps = [
  { Icon: Building2, title: "1. Register your organization", text: "Choose the Agency role and give your organization's name." },
  { Icon: ShieldCheck, title: "2. Administrator review", text: "An administrator checks your profile, registration details, operating region and safeguarding contact." },
  { Icon: UsersRound, title: "3. Start coordinating", text: "Once verified, you can assess requests, match resources and record deliveries." },
];

export default function AgencyApplication() {
  return (
    <AuthLayout>
      <div className="auth-form">
        <span className="eyebrow">For humanitarian organizations</span>
        <h1>Apply as an agency</h1>
        <p>Agencies are reviewed before they can publish needs or manage deliveries.</p>
        <div style={{ display: "grid", gap: 12, margin: "16px 0" }}>
          {steps.map(({ Icon, title, text }) => (
            <div className="demo-account-card" key={title}>
              <span className="demo-role-icon agency">
                <Icon />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
        <Button to="/register">
          Register your organization <ArrowRight />
        </Button>
      </div>
    </AuthLayout>
  );
}
