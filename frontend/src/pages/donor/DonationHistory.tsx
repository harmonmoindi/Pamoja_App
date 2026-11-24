const mockDonations = [
  {
    id: "1",
    opportunityTitle: "Community Water Project",
    amount: 5000,
    paymentMethod: "M-Pesa",
    createdAt: "2026-02-12",
    status: "Successful" as const,
    transactionCode: "MPESA-20260212-001",
  },
  {
    id: "2",
    opportunityTitle: "School Supplies Drive",
    amount: 2500,
    paymentMethod: "Card",
    createdAt: "2026-01-28",
    status: "Successful" as const,
    transactionCode: "CARD-20260128-002",
  },
  {
    id: "3",
    opportunityTitle: "Food Bank Support",
    amount: 1200,
    paymentMethod: "M-Pesa",
    createdAt: "2026-01-15",
    status: "Pending" as const,
    transactionCode: "MPESA-20260115-003",
  },
];

export default function DonationHistory() {
  const donations = mockDonations;

  const totalDonated = donations
    .filter((donation) => donation.status === "Successful")
    .reduce((total, donation) => total + donation.amount, 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);

  const statusStyles = {
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
        <p className="text-sm text-gray-500">Total Successful Donations</p>
        <h2 className="mt-2 text-3xl font-bold text-green-600">
          {formatCurrency(totalDonated)}
        </h2>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-4">Opportunity</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Payment Method</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Transaction ID</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {donations.map((donation) => (
              <tr key={donation.id}>
                <td className="px-5 py-4 font-medium text-gray-900">
                  {donation.opportunityTitle}
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
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      statusStyles[donation.status]
                    }`}
                  >
                    {donation.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500">
                  {donation.transactionCode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
