import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { ProcessSteps } from "@/components/beneficiary/ProcessSteps";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";

export default function RequestTracking() {
  const { requests } = useBeneficiaryRequests();

  return (
    <BeneficiaryPage
      title="Request tracking"
      description="The demonstration workflow, from a submitted request through delivery confirmation."
    >
      <div className="bn-dash bn-section">
        <section className="bn-panel bn-process bn-workflow">
          <h2>Full workflow</h2>
          <ProcessSteps detailed />
        </section>
        <section className="bn-panel">
          <h2>Recorded status</h2>
          <ul className="bn-track-list">
            {requests.map((request) => (
              <li key={request.reference}>
                <div>
                  <Link to={`/beneficiary/requests/${request.reference}`}>{request.title}</Link>
                  <span>
                    {request.reference} · {request.location}
                  </span>
                </div>
                <span className={`bn-status ${request.status === "approved" ? "" : request.status.replace(" ", "-")}`}>
                  {request.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </BeneficiaryPage>
  );
}
