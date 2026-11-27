import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useOpportunities } from "../../hooks/useOpportunities";
import { pledgeService } from "../../services/pledgeService";
import type { Pledge, PledgeType } from "../../types/pledge";

export default function PledgePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    opportunities,
    loading: opportunitiesLoading,
    error: opportunitiesError,
  } = useOpportunities();

  const [opportunityId, setOpportunityId] = useState(
    searchParams.get("opportunityId") ?? ""
  );

  const [pledgeType, setPledgeType] =
    useState<PledgeType>("financial");

  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("M-Pesa");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdPledge, setCreatedPledge] =
    useState<Pledge | null>(null);

  const availableOpportunities = opportunities.filter(
    (opportunity) =>
      opportunity.status === "Published" ||
      opportunity.status === "Pledged"
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const selectedId = Number(opportunityId);

    const selectedOpportunity = availableOpportunities.find(
      (opportunity) => opportunity.id === selectedId
    );

    if (!selectedOpportunity) {
      setError("Please select a valid opportunity.");
      return;
    }

    const pledgeAmount = Number(amount);
    const pledgeQuantity = Number(quantity);

    if (
      pledgeType === "financial" &&
      (!Number.isFinite(pledgeAmount) || pledgeAmount <= 0)
    ) {
      setError("Enter a valid financial pledge amount.");
      return;
    }

    if (
      pledgeType === "in_kind" &&
      (!Number.isInteger(pledgeQuantity) || pledgeQuantity <= 0)
    ) {
      setError("Enter a valid resource quantity.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await pledgeService.create({
        opportunityId: selectedId,
        type: pledgeType,
        ...(pledgeType === "financial"
          ? {
              amount: pledgeAmount,
              paymentMethod,
            }
          : {
              quantity: pledgeQuantity,
            }),
        description: description.trim() || undefined,
      });

      setCreatedPledge(response.pledge);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your pledge. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(value);

  if (createdPledge) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h1 className="text-2xl font-bold text-green-800">
            Pledge Recorded Successfully
          </h1>

          <p className="mt-3 text-sm text-green-700">
            Your pledge has been saved successfully.
          </p>

          <div className="mt-5 space-y-3 rounded-lg bg-white p-5">
            <div>
              <p className="text-sm text-gray-500">
                Pledge Reference
              </p>
              <p className="font-semibold text-gray-900">
                {createdPledge.reference}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Opportunity
              </p>
              <p className="font-semibold text-gray-900">
                {createdPledge.opportunityTitle}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Pledge
              </p>
              <p className="font-semibold text-gray-900">
                {pledgeType === "financial"
                  ? formatCurrency(createdPledge.amount)
                  : `${createdPledge.quantity ?? Number(quantity)} items`}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>
              <p className="font-semibold text-yellow-700">
                {createdPledge.status}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-green-800">
            This is a pledge commitment, not confirmation
            that payment or resource delivery has occurred.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/donor/pledges")}
              className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white"
            >
              View My Pledges
            </button>

            <button
              type="button"
              onClick={() => navigate("/donor/dashboard")}
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Make a Pledge
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Commit to supporting a humanitarian opportunity.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-6"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select Opportunity
          </label>

          <select
            required
            value={opportunityId}
            onChange={(event) =>
              setOpportunityId(event.target.value)
            }
            disabled={opportunitiesLoading}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="">
              {opportunitiesLoading
                ? "Loading opportunities..."
                : "Choose an opportunity"}
            </option>

            {availableOpportunities.map((opportunity) => (
              <option
                key={opportunity.id}
                value={opportunity.id}
              >
                {opportunity.title} — {opportunity.county}
              </option>
            ))}
          </select>

          {opportunitiesError && (
            <p className="mt-2 text-sm text-red-600">
              {opportunitiesError}
            </p>
          )}

          {!opportunitiesLoading &&
            !opportunitiesError &&
            availableOpportunities.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No published opportunities are currently available.
              </p>
            )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Pledge Type
          </label>

          <select
            value={pledgeType}
            onChange={(event) =>
              setPledgeType(
                event.target.value as PledgeType
              )
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="financial">
              Financial Pledge
            </option>

            <option value="in_kind">
              Resource / In-Kind Pledge
            </option>
          </select>
        </div>

        {pledgeType === "financial" ? (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Pledge Amount (KES)
              </label>

              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="Enter pledge amount"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Intended Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                <option value="M-Pesa">M-Pesa</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">
                  Bank Transfer
                </option>
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Resource Quantity
            </label>

            <input
              type="number"
              required
              min="1"
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              placeholder="Enter number of items"
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            maxLength={255}
            rows={3}
            placeholder="Additional information about your pledge"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-sm text-orange-800">
            Submitting a financial pledge records your
            commitment. It does not initiate an M-Pesa payment.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={
            submitting ||
            opportunitiesLoading ||
            availableOpportunities.length === 0
          }
          className="w-full rounded-lg bg-orange-600 px-5 py-3 font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Pledge"}
        </button>
      </form>
    </div>
  );
}