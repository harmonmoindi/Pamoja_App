
import { useEffect, useState } from "react";
import PledgeTable from "../../components/portal/PledgeTable";
import { pledgeService } from "../../services/pledgeService";
import type { Pledge } from "../../types/pledge";

export default function MyPledges() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPledges = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await pledgeService.getMine();
        setPledges(response.items);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your pledges."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPledges();
  }, []);

  const totalPledged = pledges.reduce(
    (total, pledge) => total + pledge.amount,
    0
  );

  const pendingPledges = pledges.filter(
    (pledge) => pledge.status === "Pending"
  );

  const fulfilledPledges = pledges.filter(
    (pledge) => pledge.status === "Fulfilled"
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Pledges
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and track your humanitarian contribution pledges.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">
          Loading your pledges...
        </p>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Total Pledged</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(totalPledged)}
              </h2>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Pending Pledges</p>
              <h2 className="mt-2 text-2xl font-bold text-yellow-600">
                {pendingPledges.length}
              </h2>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Fulfilled Pledges</p>
              <h2 className="mt-2 text-2xl font-bold text-green-600">
                {fulfilledPledges.length}
              </h2>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pledge History
            </h2>

            {pledges.length > 0 ? (
              <PledgeTable pledges={pledges} />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                <p className="text-gray-600">
                  You haven't made any pledges yet.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
