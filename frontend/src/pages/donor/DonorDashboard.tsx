import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CalendarDays, PlusCircle, RefreshCw } from "lucide-react";
import OpportunityCard from "../../components/opportunities/OpportunityCard";
import { useOpportunities } from "../../hooks/useOpportunities";
import { donationService } from "../../services/donationService";
import { pledgeService } from "../../services/pledgeService";
import type { Donation } from "../../types/donation";
import type { Pledge } from "../../types/pledge";

export default function DonorDashboard() {
  const navigate = useNavigate();

  const {
    opportunities,
    loading: opportunitiesLoading,
    error: opportunitiesError,
    refresh: refreshOpportunities,
  } = useOpportunities();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loadingContributions, setLoadingContributions] = useState(true);
  const [contributionError, setContributionError] = useState<string | null>(null);

  const fetchContributions = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void fetchContributions();
  }, [fetchContributions]);

  const refreshDashboard = async () => {
    await Promise.all([
      refreshOpportunities(),
      fetchContributions(),
    ]);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);

  const isSuccessful = (status: string) =>
    status.toLowerCase() === "successful";

  const isActivePledge = (status: string) =>
    ["pending", "confirmed"].includes(status.toLowerCase());

  const successfulDonations = donations.filter((donation) =>
    isSuccessful(donation.status)
  );

  const activePledges = pledges.filter((pledge) =>
    isActivePledge(pledge.status)
  );

  const totalDonated = successfulDonations.reduce(
    (total, donation) => total + donation.amount,
    0
  );

  const totalPledged = activePledges.reduce(
    (total, pledge) => total + pledge.amount,
    0
  );

  const completedDonations = successfulDonations.length;

  const handleDonate = (opportunityId: number) => {
    navigate(`/donor/donate/${opportunityId}`);
  };

  const isRefreshing = opportunitiesLoading || loadingContributions;

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
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
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <CalendarDays size={18} />
            My Appointments
          </button>

          <button
            type="button"
            onClick={() => navigate("/donor/appointments/book")}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-orange-700"
          >
            <PlusCircle size={18} />
            Book an Appointment
          </button>
        </div>
      </div>

      {/* Contribution Error */}
      {contributionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {contributionError}
        </div>
      )}

      {/* Dashboard Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Donated */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Donated
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {loadingContributions
              ? "Loading..."
              : formatCurrency(totalDonated)}
          </h2>

          <p className="mt-2 text-xs text-gray-500">
            Successful financial donations
          </p>
        </div>

        {/* Total Pledged */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Pledged
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {loadingContributions
              ? "Loading..."
              : formatCurrency(totalPledged)}
          </h2>

          <p className="mt-2 text-xs text-gray-500">
            Pending and confirmed pledges
          </p>
        </div>

        {/* Completed Donations */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Completed Donations
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {loadingContributions
              ? "..."
              : completedDonations}
          </h2>

          <p className="mt-2 text-xs text-gray-500">
            Successful transactions
          </p>
        </div>

        {/* Active Opportunities */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Opportunities Shown
          </p>

          <h2 className="mt-2 text-2xl font-bold text-orange-600">
            {opportunitiesLoading
              ? "..."
              : opportunities.length}
          </h2>

          <p className="mt-2 text-xs text-gray-500">
            Available in the current results
          </p>
        </div>
      </section>

      {/* Discover Opportunities */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Discover Opportunities
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Explore humanitarian initiatives you can support.
            </p>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => void refreshDashboard()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-orange-500 px-4 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />

            {isRefreshing ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </div>

        {/* Opportunity Error */}
        {opportunitiesError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {opportunitiesError}
          </div>
        )}

        {/* Opportunity Loading */}
        {opportunitiesLoading ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Loading opportunities...
          </p>
        ) : opportunities.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              No published opportunities are currently available.
            </p>

            <p className="mt-2 text-xs text-gray-500">
              New opportunities will appear here once published
              by humanitarian agencies.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.map((opportunity) => (
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