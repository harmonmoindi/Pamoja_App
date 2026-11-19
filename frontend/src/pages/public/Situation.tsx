import { useState } from "react";
import { AlertTriangle, MapPin, Search, HeartHandshake, ClipboardList, Activity } from "lucide-react";
import { reports, type Priority } from "../../data/mock/reports";

const priorityColors: Record<Priority, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Moderate: "bg-yellow-100 text-yellow-800"
};

const inputClass = "rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-600 focus:outline-none";

export default function Situation() {
  const [search, setSearch] = useState("");
  const [county, setCounty] = useState("All");
  const [priority, setPriority] = useState("All");

  const counties = [...new Set(reports.map(r => r.county))];
  const visible = reports.filter(r =>
    (county === "All" || r.county === county) &&
    (priority === "All" || r.priority === priority) &&
    [r.title, r.category, r.county].some(v => v.toLowerCase().includes(search.trim().toLowerCase()))
  );

  const stats = [
    { label: "Active Reports", value: reports.filter(r => r.status === "Active").length, icon: ClipboardList },
    { label: "Counties Covered", value: counties.length, icon: MapPin },
    { label: "Households in Sample Reports", value: reports.reduce((sum, r) => sum + r.householdsAffected, 0), icon: HeartHandshake },
    { label: "Critical Situations", value: reports.filter(r => r.priority === "Critical").length, icon: AlertTriangle }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-900 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center gap-3">
            <Activity size={30} />
            <span className="text-sm font-semibold uppercase tracking-wider text-green-200">Pamoja Humanitarian Platform</span>
          </div>

          <h1 className="text-4xl font-bold md:text-5xl">Humanitarian Situation Overview</h1>
          <p className="mt-6 max-w-3xl text-lg text-green-100">
            Explore humanitarian assistance needs, understand community challenges, and discover areas requiring coordinated support.
          </p>
          <p className="mt-8 rounded-lg border border-green-600 bg-green-800 p-4 text-sm text-green-100">
            Demonstration dashboard: All statistics, reports, locations, and household figures are fictional examples, not verified humanitarian conditions.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <Icon size={28} className="mb-4 text-green-600" />
              <p className="text-sm text-gray-600">{label}</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-800">{value.toLocaleString()}</h2>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800">Humanitarian Needs by County</h2>
          <p className="mt-2 text-gray-600">Explore sample humanitarian situations and their priority levels.</p>

          <div className="my-8 flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm lg:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search situations..." aria-label="Search humanitarian situations" className={`${inputClass} w-full pl-10`} />
            </div>

            <select value={county} onChange={e => setCounty(e.target.value)} aria-label="Filter by county" className={inputClass}>
              <option value="All">All Counties</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={priority} onChange={e => setPriority(e.target.value)} aria-label="Filter by priority" className={inputClass}>
              <option value="All">All Priorities</option>
              {(["Critical", "High", "Moderate"] as const).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {visible.map(r => (
              <article key={r.id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${priorityColors[r.priority]}`}>{r.priority} Priority</span>
                  <span className="text-sm text-gray-500">{r.id}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-800">{r.title}</h3>
                <p className="mt-3 flex items-center gap-2 text-gray-600"><MapPin size={18} className="text-green-600" /> {r.county} County</p>
                <p className="mt-4 text-gray-600">{r.description}</p>

                <dl className="mt-6 space-y-3 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Assistance Category</dt>
                    <dd className="font-medium text-gray-800">{r.category}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Households in Sample</dt>
                    <dd className="font-semibold text-gray-800">{r.householdsAffected}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Report Status</dt>
                    <dd className="font-semibold text-green-700">{r.status}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          {visible.length === 0 &&
            <p className="rounded-xl bg-white p-12 text-center text-gray-500">No humanitarian situations match your search.</p>}

          <p className="mt-6 text-sm text-gray-500">Showing {visible.length} of {reports.length} sample reports.</p>
        </section>
      </div>
    </main>
  );
}