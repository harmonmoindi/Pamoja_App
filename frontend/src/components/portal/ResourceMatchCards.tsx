import { Package, MapPin, ArrowRight, CheckCircle } from "lucide-react";

export interface MatchingNeed {
  id: string;
  category: string;
  county: string;
  required: number;
  allocated: number;
  unit: string;
}

export interface MatchingResource {
  id: string;
  category: string;
  county: string;
  available: number;
  unit: string;
}

interface ResourceMatchCardsProps {
  needs: MatchingNeed[];
  resources: MatchingResource[];
  onSelectMatch?: (needId: string, resourceId: string, quantity: number) => void;
}

export default function ResourceMatchCards({ needs, resources, onSelectMatch }: ResourceMatchCardsProps) {
  const matches = needs.flatMap(need => {
    const remaining = Math.max(0, need.required - need.allocated);
    if (!remaining) return [];

    return resources
      .filter(r => r.category === need.category && r.unit === need.unit && r.available > 0)
      .map(resource => ({
        need, resource,
        quantity: Math.min(remaining, resource.available),
        sameCounty: need.county === resource.county
      }));
  }).sort((a, b) => Number(b.sameCounty) - Number(a.sameCounty));

  return (
    <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Recommended Resource Matches</h2>
        <p className="mt-2 text-gray-600">Compatible resources available for outstanding beneficiary needs.</p>
        <p className="mt-2 text-sm text-amber-700">Demo recommendations — selecting a match does not allocate stock.</p>
      </header>

      {matches.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <Package size={36} className="mx-auto mb-3 text-gray-400" />
          <p className="font-medium text-gray-700">No compatible resources available.</p>
          <p className="mt-2 text-sm text-gray-500">Additional resources may be required to fulfil outstanding requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {matches.map(({ need, resource, quantity, sameCounty }) => (
            <article key={`${need.id}-${resource.id}`} className="rounded-xl border border-gray-200 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${sameCounty ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                  {sameCounty ? "Local Match" : "Cross-County Match"}
                </span>
                <CheckCircle size={20} className="text-green-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-800">{need.category}</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-1 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Beneficiary Location</p>
                    <p className="text-sm text-gray-600">{need.county}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package size={18} className="mt-1 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Resource Location</p>
                    <p className="text-sm text-gray-600">{resource.county}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Request ID: {need.id}</p>
                <p className="mt-1 text-sm text-gray-600">Resource ID: {resource.id}</p>
                <p className="mt-2 text-sm text-gray-600">Available: {resource.available} {resource.unit}</p>
                <p className="mt-2 font-semibold text-green-700">Suggested Allocation: {quantity} {need.unit}</p>
              </div>

              {onSelectMatch && (
                <button type="button" onClick={() => onSelectMatch(need.id, resource.id, quantity)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700">
                  Select Match <ArrowRight size={18} />
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}