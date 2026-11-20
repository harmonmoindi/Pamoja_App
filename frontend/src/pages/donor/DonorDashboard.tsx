import OpportunityCard from "../../components/opportunities/OpportunityCard";
import { mockOpportunities } from "../../data/mock/opportunities";

export default function DonorDashboard() {
  const totalDonated = 0;
  const totalPledged = 0;
  const completedDonations = 0;

  const recentOpportunities = mockOpportunities.slice(0, 3);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);

  const handleDonate = (opportunityId: number) => {
    console.log("Selected opportunity:", opportunityId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Donor Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here is an overview of your contributions.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Donated</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(totalDonated)}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Pledged</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(totalPledged)}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Completed Donations</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {completedDonations}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active Opportunities</p>
          <h2 className="mt-2 text-2xl font-bold text-orange-600">
            {recentOpportunities.length}
          </h2>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Discover Opportunities
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Explore humanitarian initiatives you can support.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recentOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onDonate={() => handleDonate(opportunity.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
