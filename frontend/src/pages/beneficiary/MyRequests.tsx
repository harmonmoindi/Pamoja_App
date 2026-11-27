import { Plus } from "lucide-react";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { RequestTable } from "@/components/beneficiary/RequestTable";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { Button } from "@/components/ui/Button";

export default function MyRequests() {
  const { requests, loading, error, refresh } = useBeneficiaryRequests();

  return (
    <BeneficiaryPage
      title="My requests"
      description="View assistance requests submitted for agency review."
      action={
        <Button to="/beneficiary/request">
          <Plus size={16} /> New request
        </Button>
      }
    >
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>All assistance requests</h2>
            <p>Live records from your beneficiary account</p>
          </div>
          <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
            Refresh
          </Button>
        </div>

        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>Loading your requests…</p>
        ) : requests.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>No assistance requests yet.</p>
        ) : (
          <RequestTable requests={requests} caption="All assistance requests" />
        )}
      </section>
    </BeneficiaryPage>
  );
}
