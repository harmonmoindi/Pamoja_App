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
  const { requests, loading, error } = useBeneficiaryRequests();
  const stats = requestStats(requests);

  return (
    <BeneficiaryPage
      title="Your assistance dashboard"
      description="Track requests from submission through agency review and donor support."
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
            <strong>{loading ? "…" : stats[key]}</strong>
            <small>Live requests</small>
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
          {error ? (
            <p className="bn-error" role="alert">{error}</p>
          ) : loading ? (
            <p className="bn-empty">Loading your requests...</p>
          ) : (
            <RequestTable requests={requests.slice(0, 4)} caption="Recent assistance requests" />
          )}
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
