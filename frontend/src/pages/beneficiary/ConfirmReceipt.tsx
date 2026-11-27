import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { Button } from "@/components/ui/Button";
import { confirmReceipt, myDeliveries } from "@/services/requestService";
import type { ReceiptOutcome } from "@/types/request";

type DeliveryOption = {
  id: number;
  reference: string;
  requestId: number;
  status: string;
  label: string;
};

const outcomeOptions: { label: string; value: ReceiptOutcome }[] = [
  { label: "Yes, everything was received", value: "complete" },
  { label: "Partially received", value: "partial" },
  { label: "Not received", value: "not_received" },
  { label: "Report a discrepancy", value: "discrepancy" },
];

export default function ConfirmReceipt() {
  const { requests, refresh } = useBeneficiaryRequests();
  const [deliveries, setDeliveries] = useState<DeliveryOption[]>([]);
  const [deliveryId, setDeliveryId] = useState<number | "">("");
  const [outcome, setOutcome] = useState<ReceiptOutcome>("complete");
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const page = await myDeliveries();
        if (!active) return;
        const mapped = page.items.map((item) => {
          const request = requests.find((req) => req.id === item.requestId);
          return {
            id: item.id,
            reference: item.reference || `DEL-${item.id}`,
            requestId: item.requestId,
            status: item.status,
            label: `${item.reference || `DEL-${item.id}`} · ${request?.resource ?? "Assistance"}`,
          };
        });
        setDeliveries(mapped);
        if (mapped.length === 1) setDeliveryId(mapped[0].id);
      } catch (err) {
        if (!active) return;
        setDeliveries([]);
        setError(err instanceof Error ? err.message : "Unable to load deliveries.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [requests]);

  const confirmable = useMemo(
    () => deliveries.filter((item) => item.status === "delivered"),
    [deliveries],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!deliveryId) {
      setError("Choose a delivery to continue.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await confirmReceipt({
        deliveryId,
        outcome,
        comments: comments.trim() || null,
      });
      setMessage(
        outcome === "complete"
          ? "Receipt confirmed. Thank you."
          : "Feedback recorded for this delivery.",
      );
      setComments("");
      await refresh();
      const page = await myDeliveries();
      setDeliveries(
        page.items.map((item) => {
          const request = requests.find((req) => req.id === item.requestId);
          return {
            id: item.id,
            reference: item.reference || `DEL-${item.id}`,
            requestId: item.requestId,
            status: item.status,
            label: `${item.reference || `DEL-${item.id}`} · ${request?.resource ?? "Assistance"}`,
          };
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit receipt confirmation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BeneficiaryPage
      title="Confirm assistance receipt"
      description="Confirm deliveries marked as delivered by your reviewing agency."
    >
      <form className="form-card" onSubmit={(event) => void submit(event)} style={{ maxWidth: 640 }}>
        <div className="demo-warning" role="note">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>Demo only: confirmation is for demonstration deliveries created in the agency portal.</p>
        </div>

        {message && (
          <p className="notice" role="status" style={{ marginTop: 16 }}>
            {message}
          </p>
        )}
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}

        <label>
          Delivery
          <select
            value={deliveryId === "" ? "" : String(deliveryId)}
            onChange={(event) => setDeliveryId(event.target.value ? Number(event.target.value) : "")}
            disabled={loading || confirmable.length === 0}
          >
            <option value="">
              {loading
                ? "Loading deliveries..."
                : confirmable.length === 0
                  ? "No delivered packages awaiting confirmation"
                  : "Select a delivery"}
            </option>
            {confirmable.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Did you receive the assistance?
          <select
            value={outcome}
            onChange={(event) => setOutcome(event.target.value as ReceiptOutcome)}
          >
            {outcomeOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
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

        <div className="form-actions" style={{ justifyContent: "flex-start" }}>
          <Button type="submit" disabled={submitting || !deliveryId}>
            {submitting ? "Submitting..." : "Submit receipt confirmation"}
          </Button>
        </div>
      </form>
    </BeneficiaryPage>
  );
}
