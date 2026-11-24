import type { Donation } from "../../types/donation";

interface PaymentStatusPanelProps {
  donation: Donation;
}

export default function PaymentStatusPanel({
  donation,
}: PaymentStatusPanelProps) {
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Successful: "bg-green-100 text-green-700",
    Failed: "bg-red-100 text-red-700",
  };

  const statusMessages = {
    Pending: "Your payment is being processed.",
    Processing: "Your payment is being processed.",
    Successful: "Your payment was successful.",
    Failed: "Your payment could not be completed.",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Payment Status
        </h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            statusStyles[donation.status]
          }`}
        >
          {donation.status}
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-600">
        {statusMessages[donation.status]}
      </p>

      <div className="mt-5 space-y-4 border-t border-gray-100 pt-4">
        <div className="flex justify-between gap-4">
          <span className="text-sm text-gray-500">
            Donation amount
          </span>

          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(donation.amount)}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-sm text-gray-500">
            Opportunity
          </span>

          <span className="text-right text-sm font-medium text-gray-900">
            {donation.opportunityTitle}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-sm text-gray-500">
            Payment method
          </span>

          <span className="text-sm font-medium text-gray-900">
            {donation.paymentMethod}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-sm text-gray-500">
            Transaction ID
          </span>

          <span className="text-right text-sm font-medium text-gray-900">
            {donation.transactionCode}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-sm text-gray-500">
            Date
          </span>

          <span className="text-sm font-medium text-gray-900">
            {new Date(donation.createdAt).toLocaleDateString(
              "en-KE"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
