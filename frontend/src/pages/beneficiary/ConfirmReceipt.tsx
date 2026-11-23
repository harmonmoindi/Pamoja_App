import { FormEvent, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { deliveryLabel, deliveryOutcomes } from "@/data/mock/beneficiaryRequests";

export default function ConfirmReceipt() {
  const { requests, confirmReceipt } = useBeneficiaryRequests();
  const deliveries = useMemo(
    () =>
      [...requests]
        .reverse()
        .map((request, index) => ({
          request,
          label: deliveryLabel(request, index),
        })),
    [requests],
  );
  const [delivery, setDelivery] = useState(deliveries[0]?.request.reference ?? "");
  const [outcome, setOutcome] = useState<(typeof deliveryOutcomes)[number]>(deliveryOutcomes[0]);
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const selected = deliveries.find((item) => item.request.reference === delivery)?.request;
    if (!selected) {
      setMessage("Choose a demonstration delivery to continue.");
      return;
    }
    if (outcome === "Yes, everything was received" && selected.status === "approved") {
      confirmReceipt(selected.reference);
    }
    setMessage(
      outcome === "Yes, everything was received"
        ? `Demonstration feedback recorded for ${selected.reference}. No real delivery took place.`
        : `Demonstration discrepancy note saved for ${selected.reference}. This does not contact an agency.`,
    );
    setComments("");
  };

  return (
    <BeneficiaryPage
      title="Confirm assistance receipt"
      description="Confirm fictional deliveries or report a discrepancy."
    >
      <form className="bn-panel bn-form bn-section" onSubmit={submit}>
        <div className="bn-alert" role="note">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>Demo only: confirmation does not represent any real-world assistance.</p>
        </div>

        {message && (
          <p className="bn-note" role="status">
            {message}
          </p>
        )}

        <label>
          Delivery
          <select value={delivery} onChange={(event) => setDelivery(event.target.value)}>
            {deliveries.map((item) => (
              <option key={item.request.reference} value={item.request.reference}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Did you receive the assistance?
          <select value={outcome} onChange={(event) => setOutcome(event.target.value as (typeof deliveryOutcomes)[number])}>
            {deliveryOutcomes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          Comments (optional)
          <textarea
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            placeholder="Describe any issue, using fictional details only"
            maxLength={280}
          />
        </label>

        <div className="bn-form-actions start">
          <button className="bn-primary" type="submit">
            Submit demonstration feedback
          </button>
        </div>
      </form>
    </BeneficiaryPage>
  );
}
