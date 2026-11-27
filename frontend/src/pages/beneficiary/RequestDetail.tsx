import { useParams } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { ProcessSteps } from "@/components/beneficiary/ProcessSteps";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { Button } from "@/components/ui/Button";
import { Status } from "@/components/ui/Status";
import { trackingStepsFor } from "@/data/mock/beneficiaryRequests";

function statusTone(status: string) {
  if (status === "under review") return "gold";
  if (status === "fulfilled") return "green";
  return "blue";
}

export default function RequestDetail() {
  const { reference = "" } = useParams();
  const { requests, loading, error, refresh } = useBeneficiaryRequests();
  const request = requests.find(
    (item) => item.reference.toLowerCase() === decodeURIComponent(reference).toLowerCase(),
  );

  if (loading) {
    return (
      <BeneficiaryPage title="Loading request" description="Fetching your assistance request.">
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      </BeneficiaryPage>
    );
  }

  if (error) {
    return (
      <BeneficiaryPage title="Unable to load request" description={error}>
        <Button variant="outline" onClick={() => void refresh()}>
          Try again
        </Button>
      </BeneficiaryPage>
    );
  }

  if (!request) {
    return (
      <BeneficiaryPage title="Request not found" description="That request reference was not found in your account.">
        <Button to="/beneficiary/requests" variant="outline">
          Back to my requests
        </Button>
      </BeneficiaryPage>
    );
  }

  return (
    <BeneficiaryPage
      title={request.title}
      description={`${request.reference} · Submitted ${request.submittedOn}. Stage: ${request.stage}.`}
      action={
        <Button to="/beneficiary/requests" variant="outline">
          All requests
        </Button>
      }
    >
      <div className="dashboard-grid">
        <section className="panel wide">
          <div className="panel-head">
            <div>
              <h2>Request details</h2>
              <p>{request.reference}</p>
            </div>
            <Status tone={statusTone(request.status)}>{request.status}</Status>
          </div>

          <dl className="review-grid">
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
            <div className="full">
              <dt>Description</dt>
              <dd>{request.summary}</dd>
            </div>
          </dl>

          {request.status === "under review" && (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Waiting for agency review. Once approved, this need is published for donors and visible to admin oversight.
            </p>
          )}
          {request.stage === "Published" && (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>Approved and published for donors.</p>
          )}
          {request.stage === "Delivered" && (
            <Button to="/beneficiary/receipt">Confirm receipt</Button>
          )}
          {request.status === "fulfilled" && (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>Receipt confirmed for this request.</p>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Assistance journey</h2>
              <p>Current progress</p>
            </div>
          </div>
          <ProcessSteps steps={trackingStepsFor(request.status)} />
          <div style={{ marginTop: 16 }}>
            <Button to="/beneficiary/tracking" variant="outline">
              View full workflow
            </Button>
          </div>
        </section>
      </div>
    </BeneficiaryPage>
  );
}
