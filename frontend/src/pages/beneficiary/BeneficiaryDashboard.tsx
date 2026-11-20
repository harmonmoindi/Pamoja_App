import { Plus } from "lucide-react";
import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { ProcessSteps } from "@/components/beneficiary/ProcessSteps";
import { RequestTable } from "@/components/beneficiary/RequestTable";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { requestStats } from "@/data/mock/beneficiaryRequests";

const statLabels = [
  ["total", "Total requests"],
  ["underReview", "Under review"],
  ["approved", "Approved"],
  ["fulfilled", "Fulfilled"],
] as const;

export default function BeneficiaryDashboard() {
  const { requests } = useBeneficiaryRequests();
  const stats = requestStats(requests);

  return (
    <BeneficiaryPage
      title="Your assistance dashboard"
      description="Track demonstration requests from submission through delivery."
      action={
        <Link className="bn-primary" to="/beneficiary/request">
          <Plus size={16} /> New assistance request
        </Link>
      }
    >
      <section className="bn-stats" aria-label="Request totals">
        {statLabels.map(([key, label]) => (
          <article key={key} className="bn-stat">
            <span>{label}</span>
            <strong>{stats[key]}</strong>
            <small>Demo data</small>
          </article>
        ))}
      </section>

      <div className="bn-dash">
        <section className="bn-panel bn-table-panel">
          <div className="bn-panel-head">
            <h2>Recent requests</h2>
            <Link className="bn-link" to="/beneficiary/requests">
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <RequestTable requests={requests.slice(0, 4)} caption="Recent demonstration requests" />
        </section>

        <section className="bn-panel bn-process">
          <h2>How the process works</h2>
          <ProcessSteps />
          <Link className="bn-secondary block" to="/beneficiary/tracking">
            View full workflow
          </Link>
        </section>
      </div>
    </BeneficiaryPage>
  );
}
