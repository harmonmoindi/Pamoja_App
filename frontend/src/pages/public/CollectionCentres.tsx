import { useEffect, useState } from "react";
import { Building2, MapPin, Clock3, Search, Package } from "lucide-react";
import { fetchCentres } from "../../services/centreService";
import type { ApiCollectionCentre } from "../../types/centre";

export default function CollectionCentres() {
  const [centres, setCentres] = useState<ApiCollectionCentre[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / Math.max(perPage, 1)));

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    fetchCentres(page)
      .then(result => {
        if (cancelled) return;
        setCentres(result.items);
        setTotal(result.total);
        setPerPage(result.perPage);
      })
      .catch(err => {
        if (cancelled) return;
        setCentres([]);
        setTotal(0);
        setError(err instanceof Error ? err.message : "Unable to load collection centres.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const filteredCentres = centres.filter(centre =>
    [
      centre.name,
      centre.county,
      centre.generalArea,
      centre.openingHours,
      ...centre.categories
    ].some(value => value.toLowerCase().includes(search.trim().toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Collection Centres
          </h1>
          <p className="mt-2 text-gray-600">
            Find humanitarian collection centres and discover where you can donate resources.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <Building2 className="mb-3 text-green-600" />
            <p className="text-gray-600">Registered Collection Centres</p>
            <h2 className="mt-2 text-3xl font-bold">{total}</h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <MapPin className="mb-3 text-blue-600" />
            <p className="text-gray-600">Counties on This Page</p>
            <h2 className="mt-2 text-3xl font-bold">
              {new Set(centres.map(c => c.county)).size}
            </h2>
          </div>
        </div>

        <div className="mb-8 rounded-xl bg-white p-5 shadow-sm">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search this page by centre, county, area or category..."
              aria-label="Search collection centres on this page"
              className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 focus:border-green-600 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-12 text-center text-gray-500">
            Loading collection centres...
          </p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCentres.map(centre => (
                <article
                  key={centre.id}
                  className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <Building2 className="mt-1 shrink-0 text-green-600" size={24} />
                    <h2 className="text-xl font-semibold text-gray-800">
                      {centre.name}
                    </h2>
                  </div>

                  <div className="space-y-3 text-gray-600">
                    <p className="flex items-center gap-2">
                      <MapPin size={18} className="shrink-0 text-green-600" />
                      {centre.generalArea}, {centre.county}
                    </p>

                    <p className="flex items-start gap-2">
                      <Clock3 size={18} className="mt-1 shrink-0 text-green-600" />
                      <span>{centre.openingHours}</span>
                    </p>

                    <div>
                      <p className="mb-2 flex items-center gap-2 font-medium text-gray-700">
                        <Package size={18} className="text-green-600" />
                        Accepted Donations
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {centre.categories.map(category => (
                          <span
                            key={category}
                            className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredCentres.length === 0 && (
              <div className="rounded-xl bg-white p-10 text-center text-gray-500">
                No collection centres found on this page.
              </div>
            )}

            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm sm:flex-row">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages} | {total} registered centres
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className="rounded-lg border border-gray-300 px-5 py-2 hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}