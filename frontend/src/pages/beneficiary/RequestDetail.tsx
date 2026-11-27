import { Link, useParams } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { ProcessSteps } from "@/components/beneficiary/ProcessSteps";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { trackingStepsFor } from "@/data/mock/beneficiaryRequests";

export default function RequestDetail() {
  const { reference = "" } = useParams();
  const { requests, confirmReceipt } = useBeneficiaryRequests();
  const request = requests.find((item) => item.reference.toLowerCase() === reference.toLowerCase());

  if (!request) {
    return (
      <BeneficiaryPage title="Request not found" description="That request reference was not found in your account.">
        <Link className="bn-secondary bn-section" to="/beneficiary/requests">
          Back to my requests
        </Link>
      </BeneficiaryPage>
    );
  }

  return (
    <BeneficiaryPage
      title={request.title}
      description={`${request.reference} · Submitted ${request.submittedOn}. Stage: ${request.stage}.`}
      action={
        <Link className="bn-secondary" to="/beneficiary/requests">
          All requests
        </Link>
      }
    >
      <div className="bn-dash bn-section">
        <section className="bn-panel bn-detail">
          <span className={`bn-status ${request.status === "approved" ? "" : request.status.replace(" ", "-")}`}>{request.status}</span>
          <dl>
            <div>
              <dt>Category</dt>
              <dd>{request.category}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{request.location}</dd>
            </div>
            <div>
              <dt>Resource</dt>
              <dd>
                {request.quantity} · {request.resource}
              </dd>
            </div>
            <div>
              <dt>Urgency</dt>
              <dd>{request.urgency}</dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd>{request.reference}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>{request.submittedOn}</dd>
            </div>
          </dl>
          <p>{request.summary}</p>
          {request.status === "approved" && request.stage === "Delivered" && (
            <button className="bn-primary" type="button" onClick={() => confirmReceipt(request.reference)}>
              Confirm receipt
            </button>
          )}
          {request.status === "fulfilled" && <p className="bn-note">Receipt confirmed for this request.</p>}
          {request.status === "under review" && <p className="bn-note">Waiting for agency review. Once approved, this need is published for donors.</p>}
          {request.stage === "Published" && <p className="bn-note">Approved and published for donors.</p>}
        </section>
        <section className="bn-panel bn-process">
          <h2>Assistance journey</h2>
          <ProcessSteps steps={trackingStepsFor(request.status)} />
          <Link className="bn-secondary block" to="/beneficiary/tracking">
            View full workflow
          </Link>
        </section>
      </div>
    </BeneficiaryPage>
  );
}
