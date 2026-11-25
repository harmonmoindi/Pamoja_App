import type { Pledge } from "../../types/pledge";

interface PledgeTableProps {
  pledges: Pledge[];
}

export default function PledgeTable({
  pledges,
}: PledgeTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Fulfilled: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  if (pledges.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">
          You have no pledges yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-5 py-4 font-medium">Opportunity</th>
            <th className="px-5 py-4 font-medium">Amount</th>
            <th className="px-5 py-4 font-medium">Payment Method</th>
            <th className="px-5 py-4 font-medium">Date</th>
            <th className="px-5 py-4 font-medium">Due Date</th>
            <th className="px-5 py-4 font-medium">Status</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {pledges.map((pledge) => (
            <tr key={pledge.id} className="hover:bg-gray-50">
              <td className="px-5 py-4 font-medium text-gray-900">
                {pledge.opportunityTitle}
              </td>

              <td className="px-5 py-4 text-gray-700">
                {formatCurrency(pledge.amount)}
              </td>

              <td className="px-5 py-4 text-gray-700">
                {pledge.paymentMethod}
              </td>

              <td className="px-5 py-4 text-gray-700">
                {new Date(pledge.createdAt).toLocaleDateString(
                  "en-KE"
                )}
              </td>

              <td className="px-5 py-4 text-gray-700">
                {pledge.dueDate
                  ? new Date(pledge.dueDate).toLocaleDateString(
                      "en-KE"
                    )
                  : "—"}
              </td>

              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    statusStyles[pledge.status]
                  }`}
                >
                  {pledge.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
