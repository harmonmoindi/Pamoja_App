import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";

const workspaces = [
  {
    to: "/beneficiary/dashboard",
    kicker: "Current",
    title: "Beneficiary workspace",
    text: "Track demonstration requests from submission through delivery.",
  },
  {
    to: "/donor/dashboard",
    kicker: "Donor",
    title: "Donor workspace",
    text: "Review fictional pledges, donations, and opportunities.",
  },
  {
    to: "/agency/dashboard",
    kicker: "Agency",
    title: "Agency workspace",
    text: "Review demonstration requests, inventory, and deliveries.",
  },
  {
    to: "/admin/dashboard",
    kicker: "Admin",
    title: "Admin workspace",
    text: "Review fictional users, verification, and platform activity.",
  },
];

export default function SwitchWorkspace() {
  return (
    <BeneficiaryPage
      title="Switch workspace"
      description="Open another demonstration workspace. These portals are not signed in and do not share a real account."
    >
      <div className="bn-workspaces bn-section">
        {workspaces.map((workspace) => (
          <Link key={workspace.to} to={workspace.to} className={workspace.kicker === "Current" ? "bn-workspace current" : "bn-workspace"}>
            <span>{workspace.kicker}</span>
            <strong>{workspace.title}</strong>
            <p>{workspace.text}</p>
          </Link>
        ))}
      </div>
    </BeneficiaryPage>
  );
}
