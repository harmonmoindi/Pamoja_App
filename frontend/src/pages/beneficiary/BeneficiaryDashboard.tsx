import { Plus } from "lucide-react";
import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { ProcessSteps } from "@/components/beneficiary/ProcessSteps";
import { RequestTable } from "@/components/beneficiary/RequestTable";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { Button } from "@/components/ui/Button";
import { Metric } from "@/components/ui/Metric";
import { requestStats } from "@/data/mock/beneficiaryRequests";

export default function BeneficiaryDashboard() {
  const { requests, loading, error } = useBeneficiaryRequests();
  const stats = requestStats(requests);

  return (
    <BeneficiaryPage
      title="Your assistance dashboard"
      description="Track requests from submission through agency review and donor support."
      action={
        <Button to="/beneficiary/request">
          <Plus size={16} /> New assistance request
        </Button>
      }
    >
      <div className="portal-metrics">
        <Metric label="Total requests" value={loading ? "…" : String(stats.total)} note="All submissions" tone="green" />
        <Metric label="Under review" value={loading ? "…" : String(stats.underReview)} note="Awaiting agency" tone="gold" />
        <Metric label="Approved" value={loading ? "…" : String(stats.approved)} note="In progress" tone="blue" />
        <Metric label="Fulfilled" value={loading ? "…" : String(stats.fulfilled)} note="Confirmed" tone="navy" />
      </div>

      <div className="dashboard-grid">
        <section className="panel wide">
          <div className="panel-head">
            <div>
              <h2>Recent requests</h2>
              <p>Latest assistance submissions</p>
            </div>
            <Button to="/beneficiary/requests" variant="ghost">
              View all
            </Button>
          </div>
          {error ? (
            <p className="error-text" role="alert">{error}</p>
          ) : loading ? (
            <p style={{ color: "var(--muted)", margin: 0 }}>Loading your requests…</p>
          ) : requests.length === 0 ? (
            <p style={{ color: "var(--muted)", margin: 0 }}>No assistance requests yet.</p>
          ) : (
            <RequestTable requests={requests.slice(0, 4)} caption="Recent assistance requests" />
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>How the process works</h2>
              <p>From submission to confirmation</p>
            </div>
          </div>
          <ProcessSteps />
          <div style={{ marginTop: 16 }}>
            <Button to="/beneficiary/tracking" variant="outline">
              View full workflow
            </Button>
          </div>
        </section>
      </div>

      <p style={{ marginTop: 18, color: "var(--muted)", fontSize: 12 }}>
        Need another portal?{" "}
        <Link to="/beneficiary/workspace" style={{ color: "var(--green)", fontWeight: 700 }}>
          Switch workspace
        </Link>
      </p>
    </BeneficiaryPage>
  );
}
