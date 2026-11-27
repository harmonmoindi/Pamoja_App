
import type { Opportunity } from "../../types/opportunity";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onDonate?: (opportunity: Opportunity) => void;
}

export default function OpportunityCard({
  opportunity,
  onDonate,
}: OpportunityCardProps) {
  const amountRaised = opportunity.raisedAmount ?? 0;
  const targetQuantity =
    opportunity.targetQuantity ?? opportunity.targetAmount ?? 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);

  const statusStyles: Record<string, string> = {
    Published: "bg-green-100 text-green-700",
    Pledged: "bg-blue-100 text-blue-700",
    Allocated: "bg-purple-100 text-purple-700",
    Delivered: "bg-gray-100 text-gray-700",
    Confirmed: "bg-gray-100 text-gray-700",
  };

  const isAvailable =
    opportunity.status === "Published" ||
    opportunity.status === "Pledged";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {opportunity.image && (
        <img
          src={opportunity.image}
          alt={opportunity.title}
          className="h-48 w-full object-cover"
        />
      )}

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium capitalize text-orange-700">
            {opportunity.category}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              statusStyles[opportunity.status] ??
              "bg-gray-100 text-gray-700"
            }`}
          >
            {opportunity.status}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {opportunity.title}
          </h3>

          <p className="mt-2 text-sm text-gray-600">
            {opportunity.description}
          </p>
        </div>

        <p className="text-sm text-gray-500">
          Location: {opportunity.location}
        </p>

        {/* Financial donations */}
        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-sm font-medium text-gray-600">
            Confirmed Financial Donations
          </p>

          <p className="mt-2 text-2xl font-bold text-orange-700">
            {formatCurrency(amountRaised)}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Total confirmed payments received
          </p>

          {/* Resource quantity */}
          {targetQuantity > 0 && (
            <div className="mt-4 border-t border-orange-100 pt-3">
              <p className="text-sm font-medium text-gray-600">
                Resource Target Quantity
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {targetQuantity.toLocaleString("en-KE")}
              </p>
            </div>
          )}

          <p className="mt-3 text-xs text-gray-500">
            Financial totals exclude pending, failed and simulated
            payments.
          </p>
        </div>

        {/* Opportunity actions */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-600">
            {opportunity.beneficiaries > 0
              ? `${opportunity.beneficiaries} beneficiaries`
              : "Support this opportunity"}
          </span>

          <button
            type="button"
            onClick={() => onDonate?.(opportunity)}
            disabled={!isAvailable || !onDonate}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isAvailable ? "Donate" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}