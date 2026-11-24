import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle, HeartHandshake, Package, RefreshCw, MapPin } from "lucide-react";
import type { AssistanceRequest } from "../../types/request";
import { getAgencyRequests, getResourceMatches, allocateResources, type MatchingResult } from "../../services/agencyService";

type Match = { id: string; requestId: string; resourceId: number; quantity: number };
const panel = "rounded-xl bg-white p-6 shadow-sm";
const field = "w-full rounded-lg border border-gray-300 p-3";
const allowedStages = ["Assessed", "Published", "Pledged", "Allocated"];
const getReference = (r: AssistanceRequest) => r.reference || `REQ-${r.id}`;
const getError = (e: unknown) => e instanceof Error ? e.message : "An unexpected error occurred.";

export default function ResourceMatching() {
  const [needs, setNeeds] = useState<AssistanceRequest[]>([]);
  const [matching, setMatching] = useState<MatchingResult | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [needId, setNeedId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [matchError, setMatchError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    async function loadRequests() {
      setLoading(true); setError("");
      try {
        const data = await getAgencyRequests(page, 20);
        if (active) { setNeeds(data.items); setTotal(data.total); }
      } catch (e) {
        if (active) { setNeeds([]); setTotal(0); setError(getError(e)); }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadRequests();
    return () => { active = false; };
  }, [page, refreshKey]);

  useEffect(() => {
    let active = true;
    setMatching(null); setResourceId(""); setMatchError("");
    if (!needId) { setMatchingLoading(false); return; }
    setMatchingLoading(true);
    getResourceMatches(Number(needId))
      .then(data => { if (active) setMatching(data); })
      .catch(e => { if (active) setMatchError(getError(e)); })
      .finally(() => { if (active) setMatchingLoading(false); });
    return () => { active = false; };
  }, [needId, refreshKey]);

  const need = needs.find(r => r.id === Number(needId));
  const resources = matching?.matches ?? [];
  const resource = resources.find(r => r.resourceId === Number(resourceId));
  const remaining = matching?.remaining ?? (need ? Math.max(0, need.quantity - need.allocated) : 0);
  const maxAmount = resource ? Math.min(remaining, resource.available) : 0;
  const amount = Number(quantity);
  const canAllocate = !!need && !!resource && allowedStages.includes(need.stage) && Number.isInteger(amount) && amount > 0 && amount <= maxAmount && !saving && !loading && !matchingLoading;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const stats = [
    { label: "Total Assigned Requests", value: total, icon: HeartHandshake },
    { label: "Compatible Inventory Items", value: resources.length, icon: Package },
    { label: "Fully Matched (This Page)", value: needs.filter(r => r.allocated >= r.quantity).length, icon: CheckCircle }
  ];

  function refreshResources() { setRefreshKey(n => n + 1); }

  function selectNeed(id: string) {
    setNeedId(id); setResourceId(""); setQuantity("1"); setMatching(null); setFormError(""); setSuccess("");
  }

  function selectMatch(id: number, suggested: number) {
    setResourceId(String(id)); setQuantity(String(suggested)); setFormError("");
    document.getElementById("allocate-resources")?.scrollIntoView({ behavior: "smooth" });
  }

  async function allocate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAllocate || !need || !resource) return;
    setSaving(true); setFormError(""); setSuccess("");
    try {
      const result = await allocateResources({ requestId: need.id, resourceId: resource.resourceId, quantity: amount });
      setMatches(prev => [...prev, { id: crypto.randomUUID(), requestId: getReference(need), resourceId: resource.resourceId, quantity: result.allocatedQuantity }]);
      setSuccess(`${result.allocatedQuantity} ${need.unit} allocated successfully to ${getReference(need)}.`);
      setResourceId(""); setQuantity("1"); setMatching(null); refreshResources();
    } catch (e) {
      setFormError(getError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen space-y-8 bg-gray-100 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Resource Matching</h1>
          <p className="mt-2 text-gray-600">Match available humanitarian resources with beneficiary needs.</p>
        </div>
        <button type="button" onClick={refreshResources} disabled={loading || saving} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw size={17} className={loading || matchingLoading ? "animate-spin" : ""} />Refresh
        </button>
      </header>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-semibold">Unable to load beneficiary requests</p><p className="mt-1 text-sm">{error}</p>
        <button type="button" onClick={refreshResources} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white">Try Again</button>
      </div>}
      {success && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{success}</p>}

      <section className="grid gap-6 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className={panel}>
            <Icon className="mb-3 text-green-600" />
            <p className="text-gray-600">{label}</p>
            <p className="mt-2 text-3xl font-bold">{loading ? "..." : value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className={panel}>
          <h2 className="mb-5 text-xl font-semibold">Beneficiary Needs</h2>
          <div className="max-h-[460px] space-y-4 overflow-y-auto">
            {loading && <p className="text-gray-500">Loading beneficiary requests...</p>}
            {!loading && !error && !needs.length && <p className="text-gray-500">No requests assigned to your agency.</p>}
            {needs.map(item => {
              const remainingNeed = Math.max(0, item.quantity - item.allocated);
              return (
                <div key={item.id} onClick={() => selectNeed(String(item.id))} className={`cursor-pointer rounded-lg border p-4 hover:border-green-500 ${needId === String(item.id) ? "border-green-600 bg-green-50" : ""}`}>
                  <h3 className="font-semibold">{item.resource} <span className="float-right text-sm font-normal text-gray-500">{getReference(item)}</span></h3>
                  <p className="mt-2 text-sm text-gray-600">{item.category} · {item.county} · Required: {item.quantity} {item.unit}</p>
                  <p className="mt-1 text-sm text-gray-600">Allocated: {item.allocated} · Remaining: {remainingNeed}</p>
                  <p className="mt-1 text-xs text-gray-500">Stage: {item.stage}</p>
                  <div className="mt-3 h-2 rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-green-600" style={{ width: `${item.quantity > 0 ? Math.min(100, (item.allocated / item.quantity) * 100) : 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-between border-t pt-4">
            <button type="button" disabled={page === 1 || loading} onClick={() => { selectNeed(""); setPage(p => Math.max(1, p - 1)); }} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button type="button" disabled={page >= totalPages || loading} onClick={() => { selectNeed(""); setPage(p => p + 1); }} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Next</button>
          </div>
        </div>

        <div className={panel}>
          <h2 className="mb-5 text-xl font-semibold">Available Resources</h2>
          <p className="mb-4 text-sm text-gray-500">Compatible inventory for the selected beneficiary request.</p>
          {!need && <p className="text-gray-500">Select a beneficiary request to view available resources.</p>}
          {need && matchingLoading && <p role="status" className="text-gray-500">Finding compatible resources...</p>}
          {matchError && <p role="alert" className="text-sm text-red-600">{matchError}</p>}
          {need && !matchingLoading && !matchError && !resources.length && <p className="text-gray-500">No compatible resources currently available.</p>}
          <div className="space-y-4">
            {need && resources.map(item => (
              <div key={item.resourceId} className="rounded-lg border p-4">
                <h3 className="font-semibold">{need.resource} <span className="float-right text-sm font-normal text-gray-500">RES-{item.resourceId}</span></h3>
                <p className="mt-2 text-sm text-gray-600">Location: {item.county}</p>
                <p className="mt-1 font-semibold text-green-700">Available: {item.available} {need.unit}</p>
                <p className="mt-1 text-sm text-gray-600">Suggested allocation: {item.suggestedQuantity} {need.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={panel}>
        <h2 className="mb-2 text-xl font-semibold">Recommended Resource Matches</h2>
        <p className="mb-6 text-gray-600">Verified inventory matches based on resource, category, unit and location.</p>
        {!need && <p className="text-gray-500">Select a beneficiary request to view recommended matches.</p>}
        {need && matchingLoading && <p className="text-gray-500">Loading recommendations...</p>}
        {need && !matchingLoading && !matchError && !resources.length && <p className="text-gray-500">No compatible resource matches available.</p>}
        <div className="grid gap-5 lg:grid-cols-2">
          {need && resources.map(item => (
            <article key={item.resourceId} className="rounded-xl border border-gray-200 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.sameCounty ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                  {item.sameCounty ? "Local Match" : "Cross-County Match"}
                </span>
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">{need.resource}</h3>
              <p className="mt-3 flex items-center gap-2 text-sm text-gray-600"><MapPin size={16} />Beneficiary: {need.county}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-gray-600"><Package size={16} />Resource: {item.county}</p>
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Request: {getReference(need)}</p>
                <p className="mt-1 text-sm text-gray-600">Inventory: RES-{item.resourceId}</p>
                <p className="mt-1 text-sm text-gray-600">Available: {item.available} {need.unit}</p>
                <p className="mt-2 font-semibold text-green-700">Suggested Allocation: {item.suggestedQuantity} {need.unit}</p>
              </div>
              <button type="button" onClick={() => selectMatch(item.resourceId, item.suggestedQuantity)} disabled={!allowedStages.includes(need.stage) || item.suggestedQuantity <= 0} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:opacity-50">
                Select Match <ArrowRight size={18} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className={panel} id="allocate-resources">
        <h2 className="mb-5 text-xl font-semibold">Allocate Resources</h2>
        <form onSubmit={allocate} className="space-y-5">
          <div>
            <label htmlFor="matching-request" className="mb-2 block font-medium">Beneficiary Request</label>
            <select id="matching-request" className={field} value={needId} required onChange={e => selectNeed(e.target.value)}>
              <option value="">Select request</option>
              {needs.map(n => <option key={n.id} value={n.id}>{getReference(n)} – {n.resource} ({n.stage})</option>)}
            </select>
          </div>
          {need && !allowedStages.includes(need.stage) && <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">This request must be assessed before resources can be allocated.</p>}
          <div>
            <label htmlFor="matching-resource" className="mb-2 block font-medium">Available Resource</label>
            <select id="matching-resource" className={field} value={resourceId} required disabled={!need || matchingLoading || !allowedStages.includes(need.stage)} onChange={e => { setResourceId(e.target.value); setQuantity("1"); }}>
              <option value="">Select resource</option>
              {need && resources.map(r => <option key={r.resourceId} value={r.resourceId}>RES-{r.resourceId} – {r.county} ({r.available} {need.unit})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="matching-quantity" className="mb-2 block font-medium">Allocation Quantity</label>
            <input id="matching-quantity" className={field} type="number" min="1" max={maxAmount || undefined} step="1" value={quantity} required disabled={!resource} onChange={e => setQuantity(e.target.value)} />
            {resource && <p className="mt-2 text-sm text-gray-500">Maximum allocation: {maxAmount} {need?.unit}</p>}
          </div>
          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
          <button type="submit" disabled={!canAllocate} className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700 disabled:opacity-50">
            {saving ? "Allocating..." : "Allocate Resource"} <ArrowRight size={18} />
          </button>
        </form>
      </section>

      <section className={panel}>
        <h2 className="mb-2 text-xl font-semibold">Recent Allocations (This Session)</h2>
        <p className="mb-5 text-sm text-gray-500">Shows allocations made since opening this page. Successful allocations are saved in the database.</p>
        {matches.length === 0 ? <p className="text-gray-500">No resources allocated during this session.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead className="bg-gray-50"><tr><th className="p-3">Request</th><th className="p-3">Resource</th><th className="p-3">Quantity</th></tr></thead>
            <tbody>{matches.map(m => (
              <tr key={m.id} className="border-b"><td className="p-3">{m.requestId}</td><td className="p-3">RES-{m.resourceId}</td><td className="p-3">{m.quantity}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </main>
  );
}