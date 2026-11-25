import { useEffect, useState } from "react";
import { ClipboardList, Clock, Truck, CheckCircle, AlertCircle, RefreshCw, MapPin, Package } from "lucide-react";
import { PageHead } from "@/components/ui/PageHead";
import type { AssistanceRequest } from "../../types/request";
import { getAgencyRequests, getDeliveries, getSituationReport, type SituationReport } from "../../services/agencyService";

const panel = "rounded-xl bg-white p-6 shadow-sm";
const getReference = (r: AssistanceRequest) => r.reference || `REQ-${r.id}`;
const getError = (e: unknown) => e instanceof Error ? e.message : "An unexpected error occurred.";
const statusColors: Record<string, string> = {
  "Need identified": "bg-yellow-100 text-yellow-800", Assessed: "bg-blue-100 text-blue-700",
  Published: "bg-purple-100 text-purple-700", Pledged: "bg-indigo-100 text-indigo-700",
  Allocated: "bg-teal-100 text-teal-700", Delivered: "bg-green-100 text-green-700",
  Confirmed: "bg-emerald-100 text-emerald-700"
};

export default function AgencyDashboard() {
  const [report, setReport] = useState<SituationReport | null>(null);
  const [recentRequests, setRecentRequests] = useState<AssistanceRequest[]>([]);
  const [requestTotal, setRequestTotal] = useState<number | null>(null);
  const [activeDeliveries, setActiveDeliveries] = useState<number | null>(null);
  const [requestsFailed, setRequestsFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      setLoading(true); setError("");
      const [reportResult, requestResult, deliveryResult] = await Promise.allSettled([
        getSituationReport(), getAgencyRequests(1, 5), getDeliveries(1, 20)
      ]);
      if (!active) return;
      const errors: string[] = [];

      if (reportResult.status === "fulfilled") setReport(reportResult.value);
      else { setReport(null); errors.push(`Situation Reports: ${getError(reportResult.reason)}`); }

      if (requestResult.status === "fulfilled") {
        setRecentRequests(requestResult.value.items); setRequestTotal(requestResult.value.total); setRequestsFailed(false);
      } else {
        setRecentRequests([]); setRequestTotal(null); setRequestsFailed(true);
        errors.push(`Assistance Requests: ${getError(requestResult.reason)}`);
      }

      if (deliveryResult.status === "fulfilled") {
        setActiveDeliveries(deliveryResult.value.items.filter(d => ["assigned", "in_transit"].includes(d.status)).length);
      } else {
        setActiveDeliveries(null); errors.push(`Deliveries: ${getError(deliveryResult.reason)}`);
      }

      setError(errors.join(" | ")); setLoading(false);
    }
    void loadDashboard();
    return () => { active = false; };
  }, [refreshKey]);

  const stats = [
    { title: "Total Requests", value: report?.totalRequests ?? requestTotal ?? "—", icon: ClipboardList },
    { title: "Pending Assessments", value: report?.byStage["Need identified"] ?? "—", icon: Clock },
    { title: "Active Deliveries (Page 1)", value: activeDeliveries ?? "—", icon: Truck },
    { title: "Confirmed Requests", value: report?.confirmedRequests ?? "—", icon: CheckCircle }
  ];
  const counties = Object.entries(report?.byCounty ?? {}).sort((a, b) => b[1] - a[1]);
  const categories = Object.entries(report?.byCategory ?? {}).sort((a, b) => b[1] - a[1]);
  const stages = Object.entries(report?.byStage ?? {});
  const totalRequests = report?.totalRequests ?? 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <PageHead eyebrow="Agency Workspace" title="Agency Dashboard" description="Monitor assistance requests, resources, and humanitarian operations." />
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-gray-600">Welcome to the Pamoja Humanitarian Coordination Platform.</p>
        <button type="button" onClick={() => setRefreshKey(n => n + 1)} disabled={loading} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />Refresh Dashboard
        </button>
      </header>

      {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-semibold">Some dashboard information could not be loaded.</p>
        <p className="mt-1 text-sm">{error}</p>
        <button type="button" onClick={() => setRefreshKey(n => n + 1)} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white">Try Again</button>
      </div>}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon }) => (
          <div key={title} className={panel}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium text-gray-600">{title}</h2><Icon className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{loading ? "..." : value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className={panel}>
          <div className="mb-5 flex items-center gap-3">
            <MapPin className="text-green-600" /><h2 className="text-xl font-semibold">Requests by County</h2>
          </div>
          {loading && <p className="text-gray-500">Loading county statistics...</p>}
          {!loading && !report && <p className="text-gray-500">County statistics are unavailable.</p>}
          {!loading && report && !counties.length && <p className="text-gray-500">No county statistics available.</p>}
          <div className="space-y-4">
            {!loading && counties.map(([county, count]) => (
              <div key={county}>
                <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{county}</span><span className="text-gray-600">{count} requests</span></div>
                <div className="h-2 rounded-full bg-gray-200"><div className="h-2 rounded-full bg-green-600" style={{ width: `${totalRequests ? (count / totalRequests) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className={panel}>
          <div className="mb-5 flex items-center gap-3">
            <Package className="text-green-600" /><h2 className="text-xl font-semibold">Requests by Category</h2>
          </div>
          {loading && <p className="text-gray-500">Loading category statistics...</p>}
          {!loading && !report && <p className="text-gray-500">Category statistics are unavailable.</p>}
          {!loading && report && !categories.length && <p className="text-gray-500">No category statistics available.</p>}
          <div className="space-y-4">
            {!loading && categories.map(([category, count]) => (
              <div key={category}>
                <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{category}</span><span className="text-gray-600">{count} requests</span></div>
                <div className="h-2 rounded-full bg-gray-200"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${totalRequests ? (count / totalRequests) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <CheckCircle className="text-green-600" /><h2 className="text-xl font-semibold text-gray-800">Request Progress</h2>
        </div>
        {loading && <p className="text-gray-500">Loading request progress...</p>}
        {!loading && !report && <p className="text-gray-500">Request progress is unavailable.</p>}
        {!loading && report && !stages.length && <p className="text-gray-500">No request progress available.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {!loading && stages.map(([stage, count]) => (
            <div key={stage} className="rounded-lg border border-gray-200 p-4">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[stage] ?? "bg-gray-100 text-gray-700"}`}>{stage}</span>
              <p className="mt-4 text-2xl font-bold">{count}</p>
              <p className="mt-1 text-xs text-gray-500">{totalRequests ? ((count / totalRequests) * 100).toFixed(1) : 0}% of requests</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <AlertCircle className="text-green-600" /><h2 className="text-xl font-semibold text-gray-800">Recent Assistance Requests</h2>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left">
          <thead className="border-b bg-gray-50"><tr>
            {["Request ID", "Category", "Location", "Priority", "Status"].map(h => <th key={h} className="p-4">{h}</th>)}
          </tr></thead>
          <tbody>{!loading && recentRequests.map(r => (
            <tr key={r.id} className="border-b hover:bg-gray-50">
              <td className="p-4 font-semibold">{getReference(r)}</td><td className="p-4">{r.category}</td>
              <td className="p-4">{r.county}</td><td className="p-4">{r.priority || r.urgency}</td>
              <td className="p-4"><span className={`rounded-full px-3 py-1 text-sm ${statusColors[r.stage] ?? "bg-gray-100 text-gray-700"}`}>{r.stage}</span></td>
            </tr>
          ))}</tbody>
        </table>
        {loading && <p role="status" className="py-8 text-center text-gray-500">Loading recent requests...</p>}
        {!loading && !requestsFailed && !recentRequests.length && <p className="py-8 text-center text-gray-500">No assistance requests have been assigned to your agency.</p>}
        {!loading && requestsFailed && <p className="py-8 text-center text-gray-500">Recent requests are currently unavailable.</p>}
        </div>
        <p className="mt-4 text-sm text-gray-500">Showing up to 5 recent requests assigned to your agency.</p>
      </section>
    </div>
  );
}