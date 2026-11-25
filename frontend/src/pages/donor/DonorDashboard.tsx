
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CalendarDays, PlusCircle } from "lucide-react";
import OpportunityCard from "../../components/opportunities/OpportunityCard";
import { useOpportunities } from "../../hooks/useOpportunities";
import { donationService } from "../../services/donationService";
import { pledgeService } from "../../services/pledgeService";
import type { Donation } from "../../types/donation";
import type { Pledge } from "../../types/pledge";

export default function DonorDashboard() {
  const {
    opportunities,
    loading: opportunitiesLoading,
    error: opportunitiesError,
  } = useOpportunities();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loadingContributions, setLoadingContributions] = useState(true);
  const [contributionError, setContributionError] = useState<string | null>(
    null
  );

  const navigate = useNavigate();

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoadingContributions(true);
        setContributionError(null);

        const [donationResponse, pledgeResponse] = await Promise.all([
          donationService.getMine(),
          pledgeService.getMine(),
        ]);

        setDonations(donationResponse.items);
        setPledges(pledgeResponse.items);
      } catch (error) {
        setContributionError(
          error instanceof Error
            ? error.message
            : "Could not load your contribution history."
        );
      } finally {
        setLoadingContributions(false);
      }
    };

    fetchContributions();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);

  const totalDonated = donations
    .filter((donation) => donation.status === "Successful")
    .reduce((total, donation) => total + donation.amount, 0);

  const totalPledged = pledges
    .filter(
      (pledge) =>
        pledge.status === "Pending" || pledge.status === "Confirmed"
    )
    .reduce((total, pledge) => total + pledge.amount, 0);

  const completedDonations = donations.filter(
    (donation) => donation.status === "Successful"
  ).length;

  const handleDonate = (opportunityId: number) => {
    navigate(`/donor/donate/${opportunityId}`);
  };

  const loading = opportunitiesLoading || loadingContributions;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Donor Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here is an overview of your contributions.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/donor/appointments")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <CalendarDays size={18} />
            My Appointments
          </button>

          <button
            type="button"
            onClick={() => navigate("/donor/appointments/book")}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-medium text-white hover:bg-orange-700"
          >
            <PlusCircle size={18} />
            Book an Appointment
          </button>
        </div>
      </div>

      {contributionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {contributionError}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Donated</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {loadingContributions ? "Loading..." : formatCurrency(totalDonated)}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Pledged</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {loadingContributions ? "Loading..." : formatCurrency(totalPledged)}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Completed Donations</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {loadingContributions ? "..." : completedDonations}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active Opportunities</p>
          <h2 className="mt-2 text-2xl font-bold text-orange-600">
            {opportunitiesLoading ? "..." : opportunities.length}
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

        {opportunitiesError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {opportunitiesError}
          </div>
        )}

        {opportunitiesLoading ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Loading opportunities...
          </p>
        ) : opportunities.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No published opportunities are currently available.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.slice(0, 3).map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onDonate={() => handleDonate(opportunity.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
