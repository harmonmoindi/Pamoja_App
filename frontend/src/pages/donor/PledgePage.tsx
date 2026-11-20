import { useState } from "react";

const mockOpportunities = [
  { id: "opp-1", title: "Community Food Distribution", status: "active" },
  { id: "opp-2", title: "Emergency Shelter Support", status: "active" },
  { id: "opp-3", title: "Clean Water Access Project", status: "active" },
];

export default function PledgePage() {
  const [opportunityId, setOpportunityId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("M-Pesa");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!opportunityId) {
      setError("Please select an opportunity.");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid pledge amount.");
      return;
    }

    // Frontend demonstration only. No pledge is saved to a backend.
    setSubmitted(true);
  };

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

      {submitted ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-800">
            Pledge Submitted
          </h2>
          <p className="mt-2 text-sm text-green-700">
            Your pledge details have been recorded for this frontend
            demonstration. No permanent record has been created.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setAmount("");
              setOpportunityId("");
            }}
            className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-white"
          >
            Make Another Pledge
          </button>
        </div>
      ) : (
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
              onChange={(event) => setOpportunityId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="">Choose an opportunity</option>
              {mockOpportunities
                .filter((opportunity: { status: string }) => opportunity.status !== "completed")
                .map((opportunity: { id: string; title: string }) => (
                  <option
                    key={opportunity.id}
                    value={opportunity.id}
                  >
                    {opportunity.title}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Pledge Amount (KES)
            </label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
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
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="M-Pesa">M-Pesa</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-orange-600 px-5 py-3 font-medium text-white hover:bg-orange-700"
          >
            Submit Pledge
          </button>
        </form>
      )}
    </div>
  );
}
