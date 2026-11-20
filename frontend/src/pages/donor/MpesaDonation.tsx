import { useState } from "react";
import { mockOpportunities } from "../../data/mock/opportunities.ts";

export default function MpesaDonation() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [opportunityId, setOpportunityId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const cleanPhone = phoneNumber.replace(/\s/g, "");

    if (!/^(?:2547|2541|07|01)\d{8}$/.test(cleanPhone)) {
      setError("Enter a valid Kenyan mobile number.");
      return;
    }

    if (Number(amount) < 1 || !Number.isFinite(Number(amount))) {
      setError("Enter a valid donation amount.");
      return;
    }

    if (!opportunityId) {
      setError("Please select an opportunity.");
      return;
    }

    // Frontend demonstration only. No M-Pesa request is sent.
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Donate with M-Pesa
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your details to prepare an M-Pesa donation.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-800">
            Donation Details Submitted
          </h2>
          <p className="mt-2 text-sm text-green-700">
            Your donation details have been validated locally.
            No payment has been made and no M-Pesa prompt has been sent.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-white"
          >
            Make Another Donation
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="0712345678"
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Donation Amount (KES)
            </label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

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
                .map((opportunity: (typeof mockOpportunities)[number]) => (
                  <option
                    key={opportunity.id}
                    value={opportunity.id}
                  >
                    {opportunity.title}
                  </option>
                ))}
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700"
          >
            Continue with M-Pesa
          </button>
        </form>
      )}
    </div>
  );
}
