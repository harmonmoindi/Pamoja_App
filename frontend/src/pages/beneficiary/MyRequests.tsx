import { Plus } from "lucide-react";
import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { RequestTable } from "@/components/beneficiary/RequestTable";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";

export default function MyRequests() {
  const { requests } = useBeneficiaryRequests();

  return (
    <BeneficiaryPage
      title="My requests"
      description="Every demonstration request saved in this browser, from the newest submission."
      action={
        <Link className="bn-primary" to="/beneficiary/request">
          <Plus size={16} /> New assistance request
        </Link>
      }
    >
      <section className="bn-panel bn-table-panel bn-section">
        {requests.length === 0 ? (
          <p className="bn-empty">No demonstration requests yet.</p>
        ) : (
          <RequestTable requests={requests} caption="All demonstration requests" />
        )}
      </section>
    </BeneficiaryPage>
  );
}
