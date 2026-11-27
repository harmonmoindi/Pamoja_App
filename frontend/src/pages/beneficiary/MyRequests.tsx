import { Plus } from "lucide-react";
import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { RequestTable } from "@/components/beneficiary/RequestTable";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";

export default function MyRequests() {
  const { requests, loading, error, refresh } = useBeneficiaryRequests();

  return (
    <BeneficiaryPage
      title="My requests"
      description="View assistance requests submitted for agency review."
      action={
        <Link className="bn-primary" to="/beneficiary/request">
          <Plus size={16} /> New request
        </Link>
      }
    >
      <section className="bn-panel bn-table-panel bn-section">
        {error && (
          <p className="bn-error" role="alert">
            {error}{" "}
            <button className="bn-link" type="button" onClick={() => void refresh()}>
              Try again
            </button>
          </p>
        )}
        {loading ? (
          <p className="bn-empty">Loading your requests...</p>
        ) : requests.length === 0 ? (
          <p className="bn-empty">No assistance requests yet.</p>
        ) : (
          <RequestTable requests={requests} caption="All assistance requests" />
        )}
      </section>
    </BeneficiaryPage>
  );
}
