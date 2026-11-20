import { useState } from "react";
import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";

export default function ConfirmReceipt() {
  const { requests, confirmReceipt } = useBeneficiaryRequests();
  const [confirmed, setConfirmed] = useState("");

  const confirm = (reference: string) => {
    confirmReceipt(reference);
    setConfirmed(reference);
  };

  return (
    <BeneficiaryPage
      title="Confirm receipt"
      description="Mark a demonstration request as fulfilled. This does not confirm a real delivery."
    >
      <section className="bn-panel bn-section">
        {confirmed && (
          <p className="bn-note" role="status">
            {confirmed} is now recorded as fulfilled in this browser.
          </p>
        )}
        <ul className="bn-receipt-list">
          {requests.map((request) => (
            <li key={request.reference}>
              <div>
                <Link to={`/beneficiary/requests/${request.reference}`}>{request.title}</Link>
                <span>
                  {request.reference} · {request.location} · {request.category}
                </span>
              </div>
              {request.status === "approved" ? (
                <button className="bn-primary" type="button" onClick={() => confirm(request.reference)}>
                  Confirm receipt
                </button>
              ) : (
                <span className={`bn-status ${request.status === "fulfilled" ? "fulfilled" : "under-review"}`}>
                  {request.status === "fulfilled" ? "Receipt confirmed" : request.status}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </BeneficiaryPage>
  );
}
