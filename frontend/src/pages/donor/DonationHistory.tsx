
import { useEffect, useState } from "react";
import { donationService } from "../../services/donationService";
import type { Donation } from "../../types/donation";

export default function DonationHistory() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await donationService.getMine();

        setDonations(response.items);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load donation history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const totalDonated = donations
    .filter((donation) => donation.status === "Successful")
    .reduce((total, donation) => total + donation.amount, 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);

  const statusStyles: Record<string, string> = {
    Successful: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Donation History
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View all your previous donations and payment records.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          Total Successful Donations
        </p>
        <h2 className="mt-2 text-3xl font-bold text-green-600">
          {formatCurrency(totalDonated)}
        </h2>
      </div>

      {loading && (
        <p className="py-6 text-center text-gray-500">
          Loading your donations...
        </p>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && donations.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="font-semibold text-gray-900">
            No donations yet
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Your donation records will appear here after you submit a donation.
          </p>
        </div>
      )}

      {!loading && !error && donations.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-4">Opportunity</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Payment Method</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Reference</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {donation.opportunityTitle || "General Donation"}
                  </td>

                  <td className="px-5 py-4">
                    {formatCurrency(donation.amount)}
                  </td>

                  <td className="px-5 py-4">
                    {donation.paymentMethod}
                  </td>

                  <td className="px-5 py-4">
                    {new Date(donation.createdAt).toLocaleDateString("en-KE")}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyles[donation.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {donation.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-gray-500">
                    {donation.reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
