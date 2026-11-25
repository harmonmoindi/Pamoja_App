import { useEffect, useState, type FormEvent } from "react";
import { Package, Clock, Truck, CheckCircle, Search, X, Plus, RefreshCw } from "lucide-react";
import type { AssistanceRequest } from "../../types/request";
import { getAgencyRequests, getDeliveries, createDelivery, updateDeliveryStatus, type Delivery, type DeliveryStatus } from "../../services/agencyService";

type DeliveryAction = { id: number; status: DeliveryStatus };
const fieldClass = "w-full rounded-lg border border-gray-300 p-3";
const panel = "rounded-xl bg-white p-6 shadow-sm";
const statusLabels: Record<DeliveryStatus, string> = {
  pending: "Pending", assigned: "Assigned", in_transit: "In Transit", delivered: "Delivered", failed: "Failed"
};
const statusColors: Record<DeliveryStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800", assigned: "bg-blue-100 text-blue-700",
  in_transit: "bg-purple-100 text-purple-700", delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700"
};
const getError = (e: unknown) => e instanceof Error ? e.message : "An unexpected error occurred.";
const getReference = (d: Delivery) => d.reference || `DEL-${d.id}`;
const getRequestRef = (r: AssistanceRequest | undefined, id: number) => r?.reference || `REQ-${id}`;

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedAction, setSelectedAction] = useState<DeliveryAction | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true); setError(""); setRequestError("");
      const [deliveryResult, requestResult] = await Promise.allSettled([getDeliveries(page, 20), getAgencyRequests(1, 100)]);
      if (!active) return;
      if (deliveryResult.status === "fulfilled") {
        setDeliveries(deliveryResult.value.items); setTotal(deliveryResult.value.total);
      } else {
        setDeliveries([]); setTotal(0); setError(getError(deliveryResult.reason));
      }
      if (requestResult.status === "fulfilled") setRequests(requestResult.value.items);
      else { setRequests([]); setRequestError(getError(requestResult.reason)); }
      setLoading(false);
    }
    void loadData();
    return () => { active = false; };
  }, [page, refreshKey]);

  const requestMap = new Map(requests.map(r => [r.id, r]));
  const query = search.trim().toLowerCase();
  const visible = deliveries.filter(d => {
    const r = requestMap.get(d.requestId);
    return (filter === "All" || d.status === filter) &&
      [getReference(d), getRequestRef(r, d.requestId), `Beneficiary #${r?.beneficiaryId ?? ""}`, r?.resource ?? "", r?.county ?? "", d.status]
        .some(s => s.toLowerCase().includes(query));
  });
  const eligibleRequests = requests.filter(r => r.allocated > 0 && !["Delivered", "Confirmed"].includes(r.stage));
  const selectedRequest = requests.find(r => r.id === Number(requestId));
  const selectedDelivery = deliveries.find(d => d.id === selectedAction?.id);
  const totalPages = Math.max(1, Math.ceil(total / 20));
  const stats = [
    { title: "Total Deliveries", value: total, icon: Package, color: "text-green-600" },
    { title: "Pending (This Page)", value: deliveries.filter(d => d.status === "pending").length, icon: Clock, color: "text-orange-600" },
    { title: "Active (This Page)", value: deliveries.filter(d => ["assigned", "in_transit"].includes(d.status)).length, icon: Truck, color: "text-blue-600" },
    { title: "Delivered (This Page)", value: deliveries.filter(d => d.status === "delivered").length, icon: CheckCircle, color: "text-green-600" }
  ];

  function refreshDeliveries() { setRefreshKey(n => n + 1); }
  function openCreate() {
    setCreateOpen(true); setRequestId(""); setFormError(""); setSuccess("");
  }
  function openAction(id: number, status: DeliveryStatus) {
    setSelectedAction({ id, status }); setFormError(""); setSuccess("");
  }

  async function saveDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRequest || saving || !eligibleRequests.some(r => r.id === selectedRequest.id)) return;
    setSaving(true); setFormError("");
    try {
      const result = await createDelivery({ requestId: selectedRequest.id });
      setSuccess(`Delivery ${getReference(result.delivery)} created successfully.`);
      setCreateOpen(false); setRequestId(""); setPage(1); refreshDeliveries();
    } catch (e) {
      setFormError(getError(e));
    } finally {
      setSaving(false);
    }
  }

  async function saveAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAction || saving) return;
    setSaving(true); setFormError("");
    try {
      const result = await updateDeliveryStatus(selectedAction.id, selectedAction.status);
      setSuccess(`${getReference(result.delivery)} updated to ${statusLabels[result.delivery.status]}.`);
      setSelectedAction(null); refreshDeliveries();
    } catch (e) {
      setFormError(getError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Deliveries Management</h1>
          <p className="mt-2 text-gray-600">Coordinate humanitarian deliveries and track resource distribution.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={refreshDeliveries} disabled={loading || saving} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 shadow-sm disabled:opacity-50">
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />Refresh
          </button>
          <button type="button" onClick={openCreate} disabled={loading} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white hover:bg-green-700 disabled:opacity-50">
            <Plus size={18} />Create Delivery
          </button>
        </div>
      </header>

      {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-semibold">Unable to load deliveries</p><p className="mt-1 text-sm">{error}</p>
        <button type="button" onClick={refreshDeliveries} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white">Try Again</button>
      </div>}
      {requestError && <p role="alert" className="mb-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">Unable to load request details: {requestError}</p>}
      {success && <p role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{success}</p>}

      <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className={panel}>
            <Icon size={20} className={`mb-3 ${color}`} /><p className="text-gray-600">{title}</p>
            <h2 className="mt-2 text-3xl font-bold">{loading ? "..." : value}</h2>
          </div>
        ))}
      </section>

      <section className={panel}>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold">Delivery Records</h2>
            <p className="mt-1 text-sm text-gray-500">Track delivery assignments, dispatch and completion.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative"><Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deliveries..." aria-label="Search deliveries" className={`${fieldClass} pl-10`} />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter deliveries" className={fieldClass}>
              <option value="All">All Statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="bg-gray-50"><tr>
            {["Delivery ID", "Request", "Beneficiary", "Resource", "County", "Status", "Actions"].map(h => <th key={h} className="p-4">{h}</th>)}
          </tr></thead>
          <tbody>{!loading && visible.map(d => {
            const r = requestMap.get(d.requestId);
            return (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-semibold">{getReference(d)}</td><td className="p-4">{getRequestRef(r, d.requestId)}</td>
                <td className="p-4">{r ? `Beneficiary #${r.beneficiaryId}` : "—"}</td>
                <td className="p-4">{r?.resource ?? "—"}{r && <p className="text-xs text-gray-500">{r.category}</p>}</td>
                <td className="p-4">{r?.county ?? "—"}</td>
                <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${statusColors[d.status]}`}>{statusLabels[d.status]}</span></td>
                <td className="p-4"><div className="flex flex-wrap gap-2">
                  {d.status === "pending" && <button type="button" onClick={() => openAction(d.id, "assigned")} className="rounded bg-blue-600 px-3 py-2 text-white">Assign</button>}
                  {d.status === "assigned" && <button type="button" onClick={() => openAction(d.id, "in_transit")} className="rounded bg-green-600 px-3 py-2 text-white">Start Transit</button>}
                  {d.status === "in_transit" && <button type="button" onClick={() => openAction(d.id, "delivered")} className="rounded bg-green-600 px-3 py-2 text-white">Mark Delivered</button>}
                  {["assigned", "in_transit"].includes(d.status) && <button type="button" onClick={() => openAction(d.id, "failed")} className="rounded bg-red-100 px-3 py-2 text-red-700">Report Failure</button>}
                  {d.status === "delivered" && <span className="text-xs text-green-700">Delivered{d.deliveredAt ? ` · ${new Date(d.deliveredAt).toLocaleDateString("en-KE")}` : ""}</span>}
                  {d.status === "failed" && <span className="text-xs text-red-700">Delivery failed</span>}
                </div></td>
              </tr>
            );
          })}</tbody>
        </table>
        {loading && <p role="status" className="py-8 text-center text-gray-500">Loading deliveries...</p>}
        {!loading && !error && !visible.length && <p className="py-8 text-center text-gray-500">No matching deliveries found.</p>}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div>
            <p className="text-sm text-gray-500">Showing {visible.length} deliveries on this page of {total} total records.</p>
            <p className="mt-1 text-xs text-gray-400">Search and filters apply to the current page.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" disabled={page === 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </section>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={e => { if (e.target === e.currentTarget && !saving) setCreateOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-delivery-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="create-delivery-title" className="text-xl font-semibold">Create Delivery</h2>
              <button type="button" onClick={() => setCreateOpen(false)} disabled={saving} aria-label="Close dialog"><X size={22} /></button>
            </div>
            <p className="mb-4 text-sm text-gray-600">Select a beneficiary request with allocated resources.</p>
            <form onSubmit={saveDelivery} className="space-y-4">
              <label className="block font-medium">Beneficiary Request
                <select required value={requestId} onChange={e => setRequestId(e.target.value)} className={`mt-2 ${fieldClass}`}>
                  <option value="">Select request</option>
                  {eligibleRequests.map(r => <option key={r.id} value={r.id}>{getRequestRef(r, r.id)} – {r.resource} ({r.allocated} {r.unit} allocated)</option>)}
                </select>
              </label>
              {selectedRequest && <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                <p><strong>Resource:</strong> {selectedRequest.resource}</p>
                <p className="mt-1"><strong>County:</strong> {selectedRequest.county}</p>
                <p className="mt-1"><strong>Beneficiary:</strong> #{selectedRequest.beneficiaryId}</p>
                <p className="mt-1"><strong>Allocated to request:</strong> {selectedRequest.allocated} {selectedRequest.unit}</p>
              </div>}
              {!eligibleRequests.length && <p className="text-sm text-yellow-700">No requests with allocated resources are available in the loaded request list.</p>}
              <p className="text-xs text-gray-500">Only the request ID is saved with this delivery. Check that another delivery hasn't already been created for this request.</p>
              {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={saving || !selectedRequest} className="rounded-lg bg-green-600 px-5 py-3 text-white disabled:opacity-50">{saving ? "Creating..." : "Create Delivery"}</button>
                <button type="button" onClick={() => setCreateOpen(false)} disabled={saving} className="rounded-lg border px-5 py-3 disabled:opacity-50">Cancel</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedAction && selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={e => { if (e.target === e.currentTarget && !saving) setSelectedAction(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="delivery-action-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="delivery-action-title" className="text-xl font-semibold">Update Delivery Status</h2>
              <button type="button" onClick={() => setSelectedAction(null)} disabled={saving} aria-label="Close dialog"><X size={22} /></button>
            </div>
            <p className="mb-3 text-sm text-gray-600">{getReference(selectedDelivery)} — {getRequestRef(requestMap.get(selectedDelivery.requestId), selectedDelivery.requestId)}</p>
            <p className="mb-5 text-sm">Change status from <strong>{statusLabels[selectedDelivery.status]}</strong> to <strong>{statusLabels[selectedAction.status]}</strong>?</p>
            {selectedAction.status === "delivered" && <p className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">Marking a delivery as delivered does not confirm beneficiary receipt. The beneficiary must confirm receipt separately.</p>}
            {selectedAction.status === "failed" && <p className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">This records a failed delivery status. The current API does not store a failure reason.</p>}
            <form onSubmit={saveAction}>
              {formError && <p role="alert" className="mb-4 text-sm text-red-600">{formError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="rounded-lg bg-green-600 px-5 py-3 text-white disabled:opacity-50">{saving ? "Saving..." : "Confirm Status"}</button>
                <button type="button" onClick={() => setSelectedAction(null)} disabled={saving} className="rounded-lg border px-5 py-3 disabled:opacity-50">Cancel</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}