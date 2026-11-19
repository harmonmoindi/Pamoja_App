import { useState, type FormEvent } from "react";
import { Package, Clock, Truck, CheckCircle, Search, X } from "lucide-react";

type DeliveryStatus = "Pending" | "Assigned" | "In Transit" | "Delivered" | "Failed";
type ActionType = "assign" | "confirm" | "fail";
interface Delivery {
  id: string; requestId: string; beneficiary: string; resource: string; quantity: string;
  county: string; assignedTo: string; scheduledDate: string; status: DeliveryStatus;
  receivedBy?: string; completedAt?: string; notes?: string;
}
interface SelectedAction { id: string; type: ActionType }
const initialDeliveries: Delivery[] = [
  { id: "DEL001", requestId: "REQ001", beneficiary: "Beneficiary A", resource: "Food Supplies", quantity: "10 packages", county: "Nairobi", assignedTo: "", scheduledDate: "", status: "Pending" },
  { id: "DEL002", requestId: "REQ002", beneficiary: "Beneficiary B", resource: "Medical Supplies", quantity: "5 kits", county: "Kiambu", assignedTo: "Distribution Team A", scheduledDate: "2026-11-19", status: "Assigned" },
  { id: "DEL003", requestId: "REQ003", beneficiary: "Beneficiary C", resource: "Clothing", quantity: "20 packages", county: "Machakos", assignedTo: "Distribution Team B", scheduledDate: "2026-11-18", status: "In Transit" },
  { id: "DEL004", requestId: "REQ005", beneficiary: "Beneficiary E", resource: "Food Supplies", quantity: "15 packages", county: "Nakuru", assignedTo: "Distribution Team C", scheduledDate: "2026-11-16", status: "Delivered", receivedBy: "Receiving Representative", completedAt: "2026-11-16" }
];
const statusColors: Record<DeliveryStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800", Assigned: "bg-blue-100 text-blue-700",
  "In Transit": "bg-purple-100 text-purple-700", Delivered: "bg-green-100 text-green-700", Failed: "bg-red-100 text-red-700"
};
const fieldClass = "w-full rounded-lg border border-gray-300 p-3";

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedAction, setSelectedAction] = useState<SelectedAction | null>(null);
  const [team, setTeam] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const selectedDelivery = deliveries.find(d => d.id === selectedAction?.id);
  const query = search.trim().toLowerCase();
  const visible = deliveries.filter(d =>
    (filter === "All" || d.status === filter) &&
    [d.id, d.requestId, d.beneficiary, d.resource, d.county, d.assignedTo].some(s => s.toLowerCase().includes(query))
  );
  const stats = [
    { title: "Total Deliveries", value: deliveries.length, icon: Package, color: "text-green-600" },
    { title: "Pending Deliveries", value: deliveries.filter(d => d.status === "Pending").length, icon: Clock, color: "text-orange-600" },
    { title: "Active Deliveries", value: deliveries.filter(d => ["Assigned", "In Transit"].includes(d.status)).length, icon: Truck, color: "text-blue-600" },
    { title: "Completed Deliveries", value: deliveries.filter(d => d.status === "Delivered").length, icon: CheckCircle, color: "text-green-600" }
  ];

  function openAction(id: string, type: ActionType) {
    setSelectedAction({ id, type }); setTeam(""); setScheduledDate("");
    setReceivedBy(""); setNotes(""); setError("");
  }
  function updateDelivery(id: string, changes: Partial<Delivery>, allowedStatuses: DeliveryStatus[]) {
    setDeliveries(prev => prev.map(d => d.id === id && allowedStatuses.includes(d.status) ? { ...d, ...changes } : d));
  }
  function startDelivery(id: string) { updateDelivery(id, { status: "In Transit" }, ["Assigned"]); }

  function saveAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAction || !selectedDelivery) return;
    const { id, type } = selectedAction;
    if (type === "assign") {
      if (selectedDelivery.status !== "Pending") return;
      if (!team.trim() || !scheduledDate) return setError("Enter a team and scheduled date.");
      updateDelivery(id, { assignedTo: team.trim(), scheduledDate, status: "Assigned" }, ["Pending"]);
    } else if (type === "confirm") {
      if (selectedDelivery.status !== "In Transit") return;
      if (!receivedBy.trim()) return setError("Enter the name of the receiving person.");
      updateDelivery(id, { status: "Delivered", receivedBy: receivedBy.trim(), completedAt: new Date().toISOString().slice(0, 10), notes: notes.trim() }, ["In Transit"]);
    } else {
      if (!["Assigned", "In Transit"].includes(selectedDelivery.status)) return;
      if (!notes.trim()) return setError("Provide a reason for the failed delivery.");
      updateDelivery(id, { status: "Failed", notes: notes.trim() }, ["Assigned", "In Transit"]);
    }
    setSelectedAction(null); setError("");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Deliveries Management</h1>
        <p className="mt-2 text-gray-600">Coordinate humanitarian deliveries and track resource distribution.</p>
        <p className="mt-2 text-sm text-amber-700">Demo mode — delivery changes are not saved to the database.</p>
      </header>
      <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
            <Icon size={20} className={`mb-3 ${color}`} /><p className="text-gray-600">{title}</p>
            <h2 className="mt-2 text-3xl font-bold">{value}</h2>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-xl font-semibold">Delivery Records</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative"><Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deliveries..." aria-label="Search deliveries" className={`${fieldClass} pl-10`} />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter deliveries" className={fieldClass}>
              {["All", ...Object.keys(statusColors)].map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50"><tr>
              {["Delivery ID", "Request", "Beneficiary", "Resource", "County", "Assigned Team", "Status", "Actions"].map(h => <th key={h} className="p-4">{h}</th>)}
            </tr></thead>
            <tbody>{visible.map(d => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-semibold">{d.id}</td><td className="p-4">{d.requestId}</td><td className="p-4">{d.beneficiary}</td>
                <td className="p-4">{d.resource}<p className="text-xs text-gray-500">{d.quantity}</p></td>
                <td className="p-4">{d.county}</td>
                <td className="p-4">{d.assignedTo || "Not assigned"}<p className="text-xs text-gray-500">{d.scheduledDate}</p></td>
                <td className="p-4"><span className={`rounded-full px-3 py-1 ${statusColors[d.status]}`}>{d.status}</span></td>
                <td className="p-4"><div className="flex flex-wrap gap-2">
                  {d.status === "Pending" && <button type="button" onClick={() => openAction(d.id, "assign")} className="rounded bg-blue-600 px-3 py-2 text-white">Assign</button>}
                  {d.status === "Assigned" && <button type="button" onClick={() => startDelivery(d.id)} className="rounded bg-green-600 px-3 py-2 text-white">Start Transit</button>}
                  {d.status === "In Transit" && <button type="button" onClick={() => openAction(d.id, "confirm")} className="rounded bg-green-600 px-3 py-2 text-white">Confirm Delivery</button>}
                  {["Assigned", "In Transit"].includes(d.status) && <button type="button" onClick={() => openAction(d.id, "fail")} className="rounded bg-red-100 px-3 py-2 text-red-700">Report Failure</button>}
                  {d.status === "Delivered" && <span className="text-xs text-gray-500">Received by {d.receivedBy || "N/A"}</span>}
                  {d.status === "Failed" && <span className="text-xs text-red-700">{d.notes || "Failed"}</span>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
          {!visible.length && <p className="py-8 text-center text-gray-500">No matching deliveries found.</p>}
        </div>
      </section>

      {selectedAction && selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="delivery-action-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="delivery-action-title" className="text-xl font-semibold">
                {selectedAction.type === "assign" ? "Assign Delivery" : selectedAction.type === "confirm" ? "Confirm Delivery" : "Report Delivery Failure"}
              </h2>
              <button type="button" onClick={() => setSelectedAction(null)} aria-label="Close dialog"><X size={22} /></button>
            </div>
            <p className="mb-4 text-sm text-gray-600">{selectedDelivery.id} — {selectedDelivery.beneficiary}</p>
            <form onSubmit={saveAction} className="space-y-4">
              {selectedAction.type === "assign" && <>
                <label className="block font-medium">Assigned Team<input required value={team} onChange={e => setTeam(e.target.value)} className={`mt-2 ${fieldClass}`} placeholder="Distribution Team" /></label>
                <label className="block font-medium">Scheduled Date<input required type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className={`mt-2 ${fieldClass}`} /></label>
              </>}
              {selectedAction.type === "confirm" && <label className="block font-medium">Received By<input required value={receivedBy} onChange={e => setReceivedBy(e.target.value)} className={`mt-2 ${fieldClass}`} /></label>}
              {selectedAction.type !== "assign" && <label className="block font-medium">
                {selectedAction.type === "fail" ? "Reason for Failure" : "Delivery Notes"}
                <textarea required={selectedAction.type === "fail"} value={notes} onChange={e => setNotes(e.target.value)} className={`mt-2 ${fieldClass}`} rows={3} />
              </label>}
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" className="rounded-lg bg-green-600 px-5 py-3 text-white">Save Changes</button>
                <button type="button" onClick={() => setSelectedAction(null)} className="rounded-lg border px-5 py-3">Cancel</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
