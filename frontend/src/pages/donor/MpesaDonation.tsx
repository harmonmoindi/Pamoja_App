
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { donationService } from "../../services/donationService";
import type { Donation } from "../../types/donation";

export default function MpesaDonation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [donation, setDonation] = useState<Donation | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const opportunityId = Number(id);
    const donationAmount = Number(amount);

    if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
      setError("Invalid opportunity. Please return and select an opportunity.");
      return;
    }

    if (!Number.isFinite(donationAmount) || donationAmount <= 0) {
      setError("Enter a valid donation amount.");
      return;
    }

    let cleanPhone = phoneNumber.replace(/[\s-]/g, "");

    if (cleanPhone.startsWith("+254")) {
      cleanPhone = cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("07") || cleanPhone.startsWith("01")) {
      cleanPhone = `254${cleanPhone.slice(1)}`;
    }

    if (!/^254[71]\d{8}$/.test(cleanPhone)) {
      setError("Enter a valid Kenyan mobile number, such as 0712345678.");
      return;
    }

    try {
      setLoading(true);

      const response = await donationService.create({
        amount: donationAmount,
        phone: cleanPhone,
        opportunityId,
      });

      setDonation(response.donation);
      setMessage(
        response.message ||
          "Your donation request has been submitted. Check its payment status below."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your donation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(value);

  if (donation) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Donation Submitted
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Your donation request has been received.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <div>
            <p className="text-sm text-gray-500">Donation Reference</p>
            <p className="mt-1 font-semibold text-gray-900">
              {donation.reference}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatCurrency(donation.amount)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <p className="mt-1 font-semibold text-gray-900">
              {donation.status}
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            {message}
          </div>

          {donation.status !== "Successful" && (
            <p className="text-sm text-gray-500">
              Your donation is not confirmed as successful yet. Check the
              payment status again after the payment process is completed.
            </p>
          )}

          <button
            type="button"
            onClick={() => navigate("/donor/donations")}
            className="w-full rounded-lg bg-orange-600 px-5 py-3 font-medium text-white hover:bg-orange-700"
          >
            View Donation History
          </button>

          <button
            type="button"
            onClick={() => navigate("/donor/dashboard")}
            className="w-full rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Donate with M-Pesa
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your details to submit a donation.
        </p>
      </div>

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

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            Selected opportunity ID
          </p>
          <p className="mt-1 font-semibold text-gray-900">
            {id || "Not provided"}
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Donation"}
        </button>
      </form>
    </div>
  );
}
