import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";

const workspaces = [
  {
    to: "/beneficiary/dashboard",
    kicker: "Current",
    title: "Beneficiary workspace",
    text: "Track assistance requests from submission through delivery.",
  },
  {
    to: "/donor/dashboard",
    kicker: "Donor",
    title: "Donor workspace",
    text: "Review pledges, donations, and opportunities.",
  },
  {
    to: "/agency/dashboard",
    kicker: "Agency",
    title: "Agency workspace",
    text: "Review requests, inventory, and deliveries.",
  },
  {
    to: "/admin/dashboard",
    kicker: "Admin",
    title: "Admin workspace",
    text: "Review users, verification, and platform activity.",
  },
];

export default function SwitchWorkspace() {
  return (
    <BeneficiaryPage
      title="Switch workspace"
      description="Open another portal workspace. Role protection still applies when authentication is enabled."
    >
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        {workspaces.map((workspace) => (
          <Link
            key={workspace.to}
            to={workspace.to}
            className="panel"
            style={{
              textDecoration: "none",
              borderColor: workspace.kicker === "Current" ? "var(--green)" : undefined,
            }}
          >
            <span className="eyebrow">{workspace.kicker}</span>
            <h2 style={{ margin: "8px 0 6px", color: "var(--navy)", fontSize: 18 }}>{workspace.title}</h2>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>{workspace.text}</p>
          </Link>
        ))}
      </div>
    </BeneficiaryPage>
  );
}
