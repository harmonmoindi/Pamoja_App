import { useMemo, useState } from "react";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { ProcessSteps } from "@/components/beneficiary/ProcessSteps";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { trackingStepsFor } from "@/data/mock/beneficiaryRequests";

export default function RequestTracking() {
  const { requests } = useBeneficiaryRequests();
  const [selected, setSelected] = useState(requests[requests.length - 1]?.reference ?? "");
  const request = useMemo(
    () => requests.find((item) => item.reference === selected) ?? requests[0],
    [requests, selected],
  );
  const steps = request ? trackingStepsFor(request.status) : [];

  return (
    <BeneficiaryPage
      title="Request tracking"
      description="Understand where a request is in the assistance journey."
    >
      <div className="bn-track-select bn-section">
        <label>
          Select a demonstration request
          <select value={request?.reference ?? ""} onChange={(event) => setSelected(event.target.value)}>
            {requests.map((item) => (
              <option key={item.reference} value={item.reference}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {request ? (
        <section className="bn-panel bn-track-card">
          <div className="bn-track-head">
            <div>
              <h2>{request.title}</h2>
              <p>
                {request.reference} · {request.location} · {request.resource}
              </p>
            </div>
            <span className={`bn-status ${request.status === "approved" ? "" : request.status.replace(" ", "-")}`}>
              {request.status}
            </span>
          </div>
          <ProcessSteps steps={steps} />
        </section>
      ) : (
        <p className="bn-empty bn-section">No demonstration requests to track yet.</p>
      )}
    </BeneficiaryPage>
  );
}
