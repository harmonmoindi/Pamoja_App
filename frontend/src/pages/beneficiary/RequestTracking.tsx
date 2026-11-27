import { useEffect, useMemo, useState } from "react";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { ProcessSteps } from "@/components/beneficiary/ProcessSteps";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { Status } from "@/components/ui/Status";
import { trackingStepsFor } from "@/data/mock/beneficiaryRequests";

function statusTone(status: string) {
  if (status === "under review") return "gold";
  if (status === "fulfilled") return "green";
  return "blue";
}

export default function RequestTracking() {
  const { requests, loading } = useBeneficiaryRequests();
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (!selected && requests[0]) {
      setSelected(requests[0].reference);
    }
  }, [requests, selected]);

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
      <section className="panel" style={{ marginBottom: 18, maxWidth: 520 }}>
        <label style={{ marginBottom: 0 }}>
          Select a request
          <select
            value={request?.reference ?? ""}
            onChange={(event) => setSelected(event.target.value)}
            disabled={loading || requests.length === 0}
          >
            {requests.length === 0 ? (
              <option value="">No requests available</option>
            ) : (
              requests.map((item) => (
                <option key={item.reference} value={item.reference}>
                  {item.title}
                </option>
              ))
            )}
          </select>
        </label>
      </section>

      {request ? (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>{request.title}</h2>
              <p>
                {request.reference} · {request.location} · {request.resource}
              </p>
            </div>
            <Status tone={statusTone(request.status)}>{request.status}</Status>
          </div>
          <ProcessSteps steps={steps} />
        </section>
      ) : (
        <p style={{ color: "var(--muted)" }}>No requests to track yet.</p>
      )}
    </BeneficiaryPage>
  );
}
